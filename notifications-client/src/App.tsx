import { Layout } from "@guardian/stand/Layout"
import { MainLayout} from "./components/MainLayout"
import { Favicon } from "@guardian/stand/Favicon"
import { useState } from "react"
import type { AppConfig, UserData } from "./model/config"
import { Search } from "./components/Search"


const getUser = ():UserData|undefined => {
    try {
        const jsonString = document.getElementById("config")?.getAttribute('data-value')
        if (!jsonString) {
            console.error("failed to read user from config")
            return undefined
        }
        const {email,firstName,lastName,avatarUrl} = JSON.parse(jsonString) as AppConfig;
        return {
          email,firstName,lastName,avatarUrl, permissions:{}
        }
    } catch (err) {
        console.error("failed to read user from config")
        return undefined
    }
}

export const App = () => {
    const [user] = useState(getUser())

    return <MainLayout user={user}>
        <Layout.Sidebar>
            <div>layout.sidebar</div>
              <h1>Hello {user?.firstName ?? "user"}.</h1>
            <p>This is a placeholder app for the Notifications Tool</p>
            <Favicon icon="raven" />
        </Layout.Sidebar>
        <Layout.Main>
            <div>layout.main</div>
            <Search />
        </Layout.Main>
    </MainLayout>
}