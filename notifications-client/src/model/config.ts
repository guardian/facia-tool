
export type UserData = {
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    permissions: Record<string,boolean>;
};

export type AppConfig = Omit<UserData,'permissions'>
