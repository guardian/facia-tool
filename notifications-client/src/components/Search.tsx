import { Button } from "@guardian/stand/Button"
import { TextInput } from "@guardian/stand/TextInput"
import { Typography } from "@guardian/stand/Typography"
import { useState } from "react"


const buildUrl = (query:string, page=1) => `/api/live/search?q=${query}&page-size=20&show-elements=image&show-tags=all&show-fields=internalPageCode%2CisLive%2CfirstPublicationDate%2Cheadline%2CtrailText%2Cbyline%2Cthumbnail%2CsecureThumbnail%2CliveBloggingNow%2CmembershipAccess%2CshortUrl%2CnewspaperPageNumber%2ClastModified&show-atoms=media&show-blocks=main&order-by=newest&order-date=published&page=${page}`

export const Search = () => {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<string>();

    const doSearch = () => {
        fetch(buildUrl(query)).then(response => response.text()).then(text => setResults(text))
    }

    return (
        <div>
            <Typography variant="titleMd">Capi search</Typography>
            <TextInput label="query"  value={query} placeholder="enter a search term" onChange={setQuery}/>
            <Button onClick={doSearch}>Search CAPI</Button>
            <div>
                <Typography>Results:</Typography>
                <pre>{results}</pre>
            </div>
        </div>
    )

}