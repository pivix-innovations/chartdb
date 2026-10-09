import React, { useEffect, useState } from 'react';
import { Check, Copy, Share2, Users } from 'lucide-react';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { useDesignDB } from '@/hooks/use-chartdb';
import { useAuth } from '@/context/auth-context/use-auth';
import {
    getCloudDiagramSharing,
    setCloudDiagramShared,
} from '@/lib/cloud-diagrams';
import { supabase } from '@/lib/supabase';

type Collaborator = { userId: string; name: string };

export const ShareDiagramButton: React.FC = () => {
    const { currentDiagram } = useDesignDB();
    const { session } = useAuth();
    const [isShared, setIsShared] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [copied, setCopied] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const shareUrl = `${window.location.origin}/diagrams/${currentDiagram.id}`;

    useEffect(() => {
        let active = true;
        void getCloudDiagramSharing(currentDiagram.id)
            .then((sharing) => {
                if (active) {
                    setIsShared(sharing.isShared);
                    setIsOwner(sharing.isOwner);
                }
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [currentDiagram.id]);

    useEffect(() => {
        if (!supabase || !session || !currentDiagram.id || !isShared) {
            setCollaborators([]);
            return;
        }
        const client = supabase;
        const channel = client.channel(
            `diagram-presence:${currentDiagram.id}`,
            {
                config: { presence: { key: session.user.id } },
            }
        );
        channel
            .on('presence', { event: 'sync' }, () => {
                const users = Object.values(channel.presenceState())
                    .flat()
                    .map((presence) => presence as unknown as Collaborator)
                    .filter((presence) => presence.userId && presence.name);
                setCollaborators(users);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    void channel.track({
                        userId: session.user.id,
                        name: session.user.email ?? 'Collaborator',
                    });
                }
            });
        return () => {
            void client.removeChannel(channel);
        };
    }, [currentDiagram.id, isShared, session]);

    const toggleSharing = async () => {
        setBusy(true);
        setError('');
        try {
            await setCloudDiagramShared(currentDiagram.id, !isShared);
            setIsShared(!isShared);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : 'Sharing could not be updated.'
            );
        } finally {
            setBusy(false);
        }
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!currentDiagram.id}
                >
                    <Share2 className="size-4" />
                    Share
                    {isShared && collaborators.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3.5" />
                            {collaborators.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-4">
                <div>
                    <h3 className="font-semibold">
                        Collaborate on this design
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Anyone with the link can view and edit this diagram
                        while signed in.
                    </p>
                </div>
                {isShared ? (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={shareUrl}
                                aria-label="Diagram share link"
                            />
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => void copyLink()}
                                aria-label="Copy share link"
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {collaborators.length}{' '}
                            {collaborators.length === 1 ? 'person' : 'people'}{' '}
                            in this design now
                        </p>
                    </div>
                ) : (
                    <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                        Sharing is off. Turn it on to let teammates open the
                        same live design.
                    </p>
                )}
                {isOwner ? (
                    <Button
                        className="w-full"
                        onClick={() => void toggleSharing()}
                        disabled={busy}
                    >
                        {busy
                            ? 'Updating…'
                            : isShared
                              ? 'Turn off link sharing'
                              : 'Enable link sharing'}
                    </Button>
                ) : isShared ? (
                    <p className="text-xs text-muted-foreground">
                        Only the diagram owner can turn link sharing off.
                    </p>
                ) : null}
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
            </PopoverContent>
        </Popover>
    );
};
