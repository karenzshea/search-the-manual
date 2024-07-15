import { useState } from 'react';


function SearchBar(Props) {
    const baseUrl = new URL(Props['url']);
    const index = Props['index'];
    const endpoint = new URL(index + '/_search/', baseUrl);

    const [searchTerm, setSearchTerm] = useState('');

    async function sendSearchRequest() {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            const body = {
                query: {
                    match: {
                        text: searchTerm
                    }
                }
            };
            const response = await fetch(endpoint, {
                mode: 'cors',
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            console.log(json);
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="search-bar">
            <label for="site-search">Search :</label>
            <input type="search" id="site-search" name="q" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

            <button onClick={sendSearchRequest}>Search</button>
        </div>
    );
}

export default SearchBar;
