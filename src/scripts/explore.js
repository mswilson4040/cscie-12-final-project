// https://jsfiddle.net/gengns/j1jm2tjx/
class Explore {
    constructor() {
        this._apiPrefix = `https://api.marcswilson.com/api/mlb/chadwick`;
        this._httpClient = new HttpClient();
        this._collectionsListEl = document.getElementById('collections');
        this.nodataEl = document.getElementById('nodata');
        this.dataAreaEl = document.getElementById('dataArea');
        this.datatable = document.querySelector('#datatable table');
        this.btnDownload = document.getElementById('btnDownload');
        this.init();
    }
    async init() {
        const loader = new Loader('Fetching MongoDB Collections...');
        const collections = await this._httpClient.get(`${this._apiPrefix}/collections`);
        this.generateCollectionList(collections);
        this.btnDownload.onclick = this.download.bind(this);
        loader.destroy();
    }
    generateCollectionList(collections) {
        if (collections) {
            for (const collection of collections) {
                const li = document.createElement('li');
                li.innerText = collection.name;
                li.onclick = this.collectionChanged.bind(this);
                this._collectionsListEl.appendChild(li);
            }
        }
    }
    async collectionChanged(evt) {
        const collectionName = evt.currentTarget.innerText;
        const loader = new Loader(`Fetching data for ${collectionName}...`);
        if (collectionName) {
            const data = await this._httpClient.get(`${this._apiPrefix}/collections/${collectionName}`);
            this.nodataEl.style.display = 'none';
            this.dataAreaEl.style.display = 'block';
            this.generateDataTable(data);
        }
        loader.destroy();
    }
    generateDataTable(data) {
        const thead = document.querySelector('#datatable thead');
        const theadTr = document.createElement('tr');
        const tbody = document.querySelector('#datatable tbody');
        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        thead.innerHTML = '';
        tbody.innerHTML = '';
        for (const column of columns) {
            const th = document.createElement('th');
            th.innerText = column;
            theadTr.appendChild(th);
        }
        thead.appendChild(theadTr);
        for (const row of data) {
            const tr = document.createElement('tr');
            const features = Object.values(row);
            const hasPlayerId = Object.keys(row).includes('playerID');
            let playerId = null;
            if (hasPlayerId) {
                playerId = row.playerID;
            }
            for (const value of features) {
                const td = document.createElement('td');
                if (playerId && playerId === value) {
                    td.innerHTML = `<a href="../views/player-info.html?playerID=${value}">${value}</a>`;
                } else {
                    td.innerText = value;
                }

                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        console.log(columns);
    }
    download() {
        const tableToCsv = new HtmlTableToCsv(this.datatable);
        tableToCsv.download();
    }

}

document.body.onload = (evt) => {
    new Explore();
};