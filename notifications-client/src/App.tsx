import { Layout } from "@guardian/stand/Layout"
import { MainLayout } from "./components/MainLayout"
import { Favicon } from "@guardian/stand/Favicon"

const testUser = {
    firstName:"test",
    lastName: "user",
    email: "test.user@example.com",
    permissions:{}
}

export const App = () => {

    return <MainLayout user={testUser}>
        <Layout.Sidebar>
            <div>layout.sidebar</div>
        </Layout.Sidebar>
        <Layout.Main>
            <div>layout.main</div>
            <h1>Hello world</h1>
            <Favicon icon="raven" />
        </Layout.Main>
    </MainLayout>
}