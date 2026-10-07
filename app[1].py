from flask import Flask, render_template, request, jsonify
import socket
import platform
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__, template_folder=".", static_folder=".", static_url_path="")

def scan_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)
        result = sock.connect_ex((host, port))
        sock.close()
        return {
            "port": port,
            "status": "Open" if result == 0 else "Closed"
        }
    except Exception:
        return {"port": port, "status": "Error"}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/discover", methods=["POST"])
def discover():
    data = request.get_json()
    host = data.get("host", "").strip()

    if not host:
        return jsonify({"error": "Please enter a host."}), 400

    try:
        ip = socket.gethostbyname(host)
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except Exception:
            hostname = host

        return jsonify({
            "input": host,
            "ip": ip,
            "hostname": hostname,
            "system": platform.system(),
            "status": "Reachable"
        })
    except socket.gaierror:
        return jsonify({"error": "Host not found."}), 400

@app.route("/scan", methods=["POST"])
def scan():
    data = request.get_json()
    host = data.get("host", "").strip()
    start_port = int(data.get("start_port", 1))
    end_port = int(data.get("end_port", 100))

    if not host:
        return jsonify({"error": "Please enter a host."}), 400

    if start_port < 1 or end_port > 65535 or start_port > end_port:
        return jsonify({"error": "Invalid port range."}), 400

    try:
        ip = socket.gethostbyname(host)
    except socket.gaierror:
        return jsonify({"error": "Host not found."}), 400

    ports = range(start_port, end_port + 1)

    with ThreadPoolExecutor(max_workers=50) as executor:
        results = list(executor.map(lambda p: scan_port(ip, p), ports))

    open_ports = [r for r in results if r["status"] == "Open"]

    return jsonify({
        "host": host,
        "ip": ip,
        "open_ports": len(open_ports),
        "results": results
    })

if __name__ == "__main__":
    app.run(debug=True)
