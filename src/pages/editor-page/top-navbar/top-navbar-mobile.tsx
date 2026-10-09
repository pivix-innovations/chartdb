import React, { useCallback } from 'react';
import { DesignDBWordmark } from '@/components/designdb-wordmark';
import { DiagramName } from './diagram-name';
import { LanguageNav } from './language-nav/language-nav';
import { Menu } from './menu/menu';
import { Button } from '@/components/button/button';
import { useSidebar } from '@/components/sidebar/use-sidebar';
import { MenuIcon } from 'lucide-react';

export interface TopNavbarMobileProps {}

export const TopNavbarMobile: React.FC<TopNavbarMobileProps> = () => {
    const renderStars = useCallback(() => {
        return (
            <a
                href="https://github.com/pivix-innovations/designdb"
                target="_blank"
                rel="noreferrer"
                className="text-xs hover:underline"
            >
                Source
            </a>
        );
    }, []);

    const { toggleSidebar } = useSidebar();

    return (
        <nav className="flex flex-col justify-between border-b px-3 md:h-12 md:flex-row md:items-center md:px-4">
            <div className="flex flex-1 flex-col justify-between gap-x-1 md:flex-row md:justify-normal">
                <div className="flex items-center justify-between pt-[4px] font-primary md:py-[4px]">
                    <div className="flex items-center gap-2">
                        <Button
                            size={'icon'}
                            variant="ghost"
                            onClick={toggleSidebar}
                        >
                            <MenuIcon className="size-5" />
                        </Button>
                        <a
                            href="https://github.com/pivix-innovations/designdb"
                            className="cursor-pointer"
                            rel="noreferrer"
                        >
                            <DesignDBWordmark />
                        </a>
                    </div>

                    <div className="flex items-center gap-2">
                        {renderStars()}
                        <LanguageNav />
                    </div>
                </div>
                <Menu />
            </div>

            <div className="flex flex-1 justify-center pb-2 pt-1">
                <DiagramName />
            </div>
        </nav>
    );
};
