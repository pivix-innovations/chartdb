import React, { useCallback } from 'react';
import { DesignDBWordmark } from '@/components/designdb-wordmark';
import { DiagramName } from './diagram-name';
import { LastSaved } from './last-saved';
import { LanguageNav } from './language-nav/language-nav';
import { Menu } from './menu/menu';
import { useAuth } from '@/context/auth-context/use-auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/button/button';
import { ShareDiagramButton } from './share-diagram-button';

export interface TopNavbarProps {}

export const TopNavbar: React.FC<TopNavbarProps> = () => {
    const { session } = useAuth();

    const renderStars = useCallback(() => {
        return (
            <a
                href="https://github.com/pivix-innovations/designdb"
                target="_blank"
                rel="noreferrer"
                className="text-sm hover:underline"
            >
                Source
            </a>
        );
    }, []);

    return (
        <nav className="flex flex-col justify-between border-b px-3 md:h-12 md:flex-row md:items-center md:px-4">
            <div className="flex flex-1 flex-col justify-between gap-x-1 md:flex-row md:justify-normal">
                <div className="flex items-center justify-between pt-[4px] font-primary md:py-[4px]">
                    <a
                        href="https://github.com/pivix-innovations/designdb"
                        className="cursor-pointer"
                        rel="noreferrer"
                    >
                        <DesignDBWordmark />
                    </a>
                </div>
                <Menu />
            </div>
            <DiagramName />
            <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
                <LastSaved />
                <ShareDiagramButton />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void supabase?.auth.signOut()}
                    title={session?.user.email}
                >
                    Sign out
                </Button>
                {renderStars()}
                <LanguageNav />
            </div>
        </nav>
    );
};
