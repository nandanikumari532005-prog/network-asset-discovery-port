async function discoverAsset() {
    const host = document.getElementById("host").value.trim();
    const message = document.getElementById("discoverMessage");

    if (host === "") {
        message.innerText = "Please enter an IP address or hostname.";
        message.style.color = "red";
        return;
    }

    message.innerText = "Discovering asset...";
    message.style.color = "#2563eb";

    try {
        const response = await fetch("/discover", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({host: host})
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        document.getElementById("assetIP").innerText = data.ip;
        document.getElementById("assetHostname").innerText = data.hostname;
        document.getElementById("assetSystem").innerText = data.system;
        document.getElementById("assetStatus").innerText = data.status;
        document.getElementById("scanHost").value = host;

        message.innerText = "Asset discovered successfully.";
        message.style.color = "green";
    } catch (error) {
        message.innerText = error.message;
        message.style.color = "red";
    }
}

async function scanPorts() {
    const host = document.getElementById("scanHost").value.trim();
    const startPort = document.getElementById("startPort").value;
    const endPort = document.getElementById("endPort").value;
    const message = document.getElementById("scanMessage");

    if (host === "") {
        message.innerText = "Please enter a target host.";
        message.style.color = "red";
        return;
    }

    message.innerText = "Scanning ports...";
    message.style.color = "#2563eb";

    try {
        const response = await fetch("/scan", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                host: host,
                start_port: startPort,
                end_port: endPort
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        document.getElementById("resultHost").innerText = data.host;
        document.getElementById("resultIP").innerText = data.ip;
        document.getElementById("openCount").innerText = data.open_ports;

        const table = document.getElementById("resultTable");
        table.innerHTML = "";

        data.results.forEach(function(result) {
            const row = document.createElement("tr");
            const portCell = document.createElement("td");
            const statusCell = document.createElement("td");

            portCell.innerText = result.port;
            statusCell.innerText = result.status;
            statusCell.className =
                result.status === "Open" ? "open" : "closed";

            row.appendChild(portCell);
            row.appendChild(statusCell);
            table.appendChild(row);
        });

        message.innerText = "Port scan completed.";
        message.style.color = "green";
    } catch (error) {
        message.innerText = error.message;
        message.style.color = "red";
    }
}
