//TODO: Replace with your own license key
// agGrid.LicenseManager.setLicenseKey("ChartIQ__MultiApp_5Devs30_January_2020__MTU4MDM0MjQwMDAwMA==c40cbaa67e6fbd2d45b729e1edab8d44");
const linkerchannelName = "symbol";

// TODO - when this is out to a URL, could look at a querystring and determine if B or S and show accordingly

const SIDE = 'B';
const LP = ''; // n/a for buy side, for sell will end up being BAML
const HEADERS = ["ParentOrderID", "ArrivalTime", "Side", "Symbol", "AlgoName", "LP", "Account", "TradeCurrency",
    "OrderQuantity", "OrderQuantityUSD", "TradeQuantityUSD", "Duration (Min)", "Assumed Risk (bps)",
    "Execution Speed ($m/min)"];
const PIVOT_HEADERS = ["Symbol", "LP", "AlgoName"];
const NUMERIC_HEADERS = ["OrderQuantity", "OrderQuanittyUSD", "TradeQuantityUSD", "Duration (Min)",
    "Assumed Risk (bps)", "Execution Speed($m/min)"];

// be lazy and go with tabs, easier than dealing with string parsing, etc of csv complications
function tsv2Data(tsv) {
    let lines = tsv.split("\n");
    let result = [];
    let headers = lines[0].split("\t");

    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split("t");
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
}

//Import example data
let data = [];
fetch('si_blotter_data.tsv').then(response => response.text()).then(tsv => data = tsv2Data(tsv));
let gridOptions = null;

function setupGridOptions() {
    //Grid column definitions
    const columnDefs = [];
    // init the headers
    for (const headerName of HEADERS) {
        headerObj = {};
        headerObj["headerName"] = headerName;
        headerObj["field"] = headerName.toLowerCase();
        if (PIVOT_HEADERS.includes(headerName)) {
            headerObj["enableRowGroup"] = true;
            headerObj["enablePivot"] = true;
        }
        else {
            headerObj["enableValue"] = true;
        }
        if (NUMERIC_HEADERS.includes(headerName)) {
            headerObj["cellClass"] = "number";
            headerObj["aggFunc"] = "sum";
            headerObj["enableValue"] = true;
        }
        columnDefs.push(headerObj);
    }


    //configure the grid
    return {
        defaultColDef: {
            filter: "true" // set filtering on for all cols
        },
        floatingFilter: true,
        columnDefs: columnDefs,
        suppressAggFuncInHeader: true,
        animateRows: true,
        rowGroupPanelShow: 'always',
        pivotPanelShow: 'always',
        //getRowNodeId: function (data) { return data.trade; },
        defaultColDef: {
            width: 120,
            sortable: true,
            resizable: true
        },
        autoGroupColumnDef: {
            width: 200
        },
        onGridReady: function (params) {
            params.api.setRowData(createRowData())
        },
        onCellDoubleClicked: function (event) { cellDoubleClickEventHandler(event); },
        components: {
            btnCellRenderer: BtnCellRenderer
            // TODO - need to fiugre out how to support imgs in here and each having their own onclick
        }
    };
}

function createRowData() {
    let rowData = [];
    for (const row of data) {
        let trade = {};
        for (const headerName of HEADERS) {
            trade[headerName.toLowerCase()] = row[headerName];
        }

        rowData.push(trade);
    }
    return rowData;
}

//==================================================================================
// Utility functions for context sharing
//----------------------------------------------------------------------------------

function fdc3OnReady(cb) {
    // if fdc3 is already available don't wait just run the calback
    return window.fdc3 ? cb() : window.addEventListener('fdc3Ready', cb);
}

function passContext(ticker) {
    fdc3OnReady(() => fdc3.broadcast({
        "type": "fdc3.instrument",
        "name": ticker,
        "id": {
            "ticker": ticker
        }
    }));
}

/**
 * Raise an intent with the ticker from the selected row as an instrument as context.
 * @param {string} ticker Ticker symbol to send as context, expects a simple string
 */
function raiseIntent(intent, ticker) {
    fdc3OnReady(() => fdc3.raiseIntent(intent, {
        "type": "fdc3.instrument",
        "name": ticker,
        "id": {
            "ticker": ticker
        }
    }));
}

/**
 * Subscribe to context from other linked components.
 */
function subscribeToContext() {
    fdc3OnReady(
        () => fdc3.addContextListener(null, context => {
            if (context.type === "fdc3.instrument") {
                const symbol = context.id.ticker;
                document.getElementById("quick-filter-box").value = symbol;
                gridOptions.api.setQuickFilter(symbol);
                console.log(`Setting quick filter to ${symbol}, stringified: ${JSON.stringify(symbol)}`);
            }
        })
    );
}

function cellDoubleClickEventHandler(event) {
    if (event.column.left === 0 && event.value && event.value.trim() !== "") {
        passContext(event.value);
    }
}

//==================================================================================
// Renderer for action buttons
//----------------------------------------------------------------------------------
// this is not used, leftover from previous implementation
function BtnCellRenderer() { }

BtnCellRenderer.prototype.init = function (params) {
    this.params = params;

    this.eGui = document.createElement('button');
    this.eGui.innerHTML = params.title;

    this.btnClickedHandler = this.btnClickedHandler.bind(this);
    this.eGui.addEventListener('click', this.btnClickedHandler);
}

BtnCellRenderer.prototype.getGui = function () {
    return this.eGui;
}

BtnCellRenderer.prototype.destroy = function () {
    this.eGui.removeEventListener('click', this.btnClickedHandler);
}

BtnCellRenderer.prototype.btnClickedHandler = function (event) {
    this.params.clicked(this.params);
}

//==================================================================================
// Main initialisation function
//----------------------------------------------------------------------------------
const init = () => {
    //what context sharing are we using?
    window.usingFDC3 = fdc3Check();
    console.log('yerah');
    if (SIDE === 'B') {
        document.title = "Blotter - Buy Side";
    } else {
        document.title = "Blotter - Sell Side";
    }
    //configure the grid
    gridOptions = setupGridOptions();

    //init the grid
    let eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    document.getElementById("quick-filter-box").oninput = function (event) {
        gridOptions.api.setQuickFilter(event.target.value);
    }
    document.getElementById("quick-filter-box").addEventListener('keyup', (event) => {
        if (event.key == "Enter" && event.target.value && event.target.value.trim() !== "") {
            passContext(event.target.value.toUpperCase());
        }
    });

    //init context subscriptions
    subscribeToContext();
};

//standard finsemble initialize pattern
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener('onReady', init);
} else {
    window.addEventListener('FSBLReady', init);
};