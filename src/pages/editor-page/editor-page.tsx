import React, { Suspense, useEffect } from 'react';
import { useRef } from 'react';
import { useDesignDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import { Toaster } from '@/components/toast/toaster';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useLocalConfig } from '@/hooks/use-local-config';
import { FullScreenLoaderProvider } from '@/context/full-screen-spinner-context/full-screen-spinner-provider';
import { LayoutProvider } from '@/context/layout-context/layout-provider';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { StorageProvider } from '@/context/storage-context/storage-provider';
import { ConfigProvider } from '@/context/config-context/config-provider';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { DesignDBProvider } from '@/context/chartdb-context/chartdb-provider';
import { HistoryProvider } from '@/context/history-context/history-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { ReactFlowProvider } from '@xyflow/react';
import { ExportImageProvider } from '@/context/export-image-context/export-image-provider';
import { DialogProvider } from '@/context/dialog-context/dialog-provider';
import { KeyboardShortcutsProvider } from '@/context/keyboard-shortcuts-context/keyboard-shortcuts-provider';
import { Spinner } from '@/components/spinner/spinner';
import { Helmet } from 'react-helmet-async';
import { AlertProvider } from '@/context/alert-context/alert-provider';
import { CanvasProvider } from '@/context/canvas-context/canvas-provider';
import { HIDE_DESIGNDB_CLOUD } from '@/lib/env';
import { useDiagramLoader } from './use-diagram-loader';
import { DiffProvider } from '@/context/diff-context/diff-provider';
import { TopNavbarMock } from './top-navbar/top-navbar-mock';
import { DiagramFilterProvider } from '@/context/diagram-filter-context/diagram-filter-provider';
import { CloudAuthGate } from './cloud-auth-gate';
import { getCloudDiagram, saveCloudDiagram } from '@/lib/cloud-diagrams';
import { useToast } from '@/components/toast/use-toast';
import { supabase } from '@/lib/supabase';

const OPEN_STAR_US_AFTER_SECONDS = 30;
const SHOW_STAR_US_AGAIN_AFTER_DAYS = 1;

export const EditorDesktopLayoutLazy = React.lazy(
    () => import('./editor-desktop-layout')
);

export const EditorMobileLayoutLazy = React.lazy(
    () => import('./editor-mobile-layout')
);

const EditorPageComponent: React.FC = () => {
    const { diagramName, currentDiagram, loadDiagramFromData } = useDesignDB();
    const { openStarUsDialog } = useDialog();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { starUsDialogLastOpen, setStarUsDialogLastOpen, githubRepoOpened } =
        useLocalConfig();
    const { initialDiagram } = useDiagramLoader();
    const { toast } = useToast();
    const savedSnapshot = useRef('');
    const currentDiagramRef = useRef(currentDiagram);
    currentDiagramRef.current = currentDiagram;

    useEffect(() => {
        if (!supabase || !currentDiagram.id) return;
        const client = supabase;
        let active = true;
        const channel = client
            .channel(`diagram-updates:${currentDiagram.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_diagrams',
                    filter: `id=eq.${currentDiagram.id}`,
                },
                () => {
                    void getCloudDiagram(currentDiagram.id)
                        .then((diagram) => {
                            if (!active || !diagram) return;
                            const snapshot = JSON.stringify(diagram);
                            if (
                                snapshot ===
                                JSON.stringify(currentDiagramRef.current)
                            )
                                return;
                            savedSnapshot.current = snapshot;
                            loadDiagramFromData(diagram);
                        })
                        .catch(() => undefined);
                }
            )
            .subscribe();
        return () => {
            active = false;
            void client.removeChannel(channel);
        };
    }, [currentDiagram.id, loadDiagramFromData]);

    useEffect(() => {
        if (!currentDiagram.id) return;
        const snapshot = JSON.stringify(currentDiagram);
        if (snapshot === savedSnapshot.current) return;
        const timer = window.setTimeout(() => {
            void saveCloudDiagram(currentDiagram)
                .then(() => {
                    savedSnapshot.current = snapshot;
                })
                .catch((error: unknown) => {
                    toast({
                        title: 'Could not save diagram to the server',
                        description:
                            error instanceof Error
                                ? error.message
                                : 'Check your connection and try again.',
                        variant: 'destructive',
                    });
                });
        }, 700);
        return () => window.clearTimeout(timer);
    }, [currentDiagram, toast]);

    useEffect(() => {
        if (HIDE_DESIGNDB_CLOUD) {
            return;
        }

        if (!currentDiagram?.id || githubRepoOpened) {
            return;
        }

        if (
            new Date().getTime() - starUsDialogLastOpen >
            1000 * 60 * 60 * 24 * SHOW_STAR_US_AGAIN_AFTER_DAYS
        ) {
            const lastOpen = new Date().getTime();
            setStarUsDialogLastOpen(lastOpen);
            setTimeout(openStarUsDialog, OPEN_STAR_US_AFTER_SECONDS * 1000);
        }
    }, [
        currentDiagram?.id,
        githubRepoOpened,
        openStarUsDialog,
        setStarUsDialogLastOpen,
        starUsDialogLastOpen,
    ]);

    return (
        <>
            <Helmet>
                <title>
                    {diagramName
                        ? `DesignDB - ${diagramName} Diagram | Visualize Database Schemas`
                        : 'DesignDB - Create & Visualize Database Schema Diagrams'}
                </title>
            </Helmet>
            <section
                className={`bg-background ${isDesktop ? 'h-screen w-screen' : 'h-dvh w-dvw'} flex select-none flex-col overflow-x-hidden`}
            >
                <Suspense
                    fallback={
                        <>
                            <TopNavbarMock />
                            <div className="flex flex-1 items-center justify-center">
                                <Spinner
                                    size={isDesktop ? 'large' : 'medium'}
                                />
                            </div>
                        </>
                    }
                >
                    {isDesktop ? (
                        <EditorDesktopLayoutLazy
                            initialDiagram={initialDiagram}
                        />
                    ) : (
                        <EditorMobileLayoutLazy
                            initialDiagram={initialDiagram}
                        />
                    )}
                </Suspense>
            </section>
            <Toaster />
        </>
    );
};

export const EditorPage: React.FC = () => (
    <CloudAuthGate>
        <LocalConfigProvider>
            <ThemeProvider>
                <FullScreenLoaderProvider>
                    <LayoutProvider>
                        <StorageProvider>
                            <ConfigProvider>
                                <RedoUndoStackProvider>
                                    <DiffProvider>
                                        <DesignDBProvider>
                                            <DiagramFilterProvider>
                                                <HistoryProvider>
                                                    <ReactFlowProvider>
                                                        <CanvasProvider>
                                                            <ExportImageProvider>
                                                                <AlertProvider>
                                                                    <DialogProvider>
                                                                        <KeyboardShortcutsProvider>
                                                                            <EditorPageComponent />
                                                                        </KeyboardShortcutsProvider>
                                                                    </DialogProvider>
                                                                </AlertProvider>
                                                            </ExportImageProvider>
                                                        </CanvasProvider>
                                                    </ReactFlowProvider>
                                                </HistoryProvider>
                                            </DiagramFilterProvider>
                                        </DesignDBProvider>
                                    </DiffProvider>
                                </RedoUndoStackProvider>
                            </ConfigProvider>
                        </StorageProvider>
                    </LayoutProvider>
                </FullScreenLoaderProvider>
            </ThemeProvider>
        </LocalConfigProvider>
    </CloudAuthGate>
);
