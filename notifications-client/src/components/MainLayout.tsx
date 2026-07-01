import { Avatar } from "@guardian/stand/Avatar";
import { Favicon } from "@guardian/stand/Favicon";
import { Layout } from "@guardian/stand/Layout";
import {
    TopBar,
    TopBarToolName
} from "@guardian/stand/TopBar";
import { type ReactNode } from "react";

export type UserData = {
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    permissions: Record<string,boolean>;
};

interface Props {
    children: ReactNode;
    user?: UserData | null;
    contentId?: string;
}

const getInitials = (user: UserData): string => {
    const firstName = user.firstName?.[0] ?? "";
    const lastName = user.lastName?.[0] ?? "";
    return `${firstName}${lastName}`.toUpperCase() || "U";
};

export const MainLayout = ({ children, user }: Props) => {
    return (
        <Layout>
            <Layout.TopBar>
                <TopBar>
                    <TopBarToolName
                        name="Notifications Tool"
                        favicon={{ icon: <Favicon icon="notifications" /> }}
                    />
                    {user && (
                        <Avatar
                            src={user.avatarUrl}
                            alt={
                                `${user.firstName} ${user.lastName}`.trim() ||
                                user.email
                            }
                            initials={getInitials(user)}
                            size="md"
                        />
                    )}
                </TopBar>
            </Layout.TopBar>
            {children}
        </Layout>
    );
};
