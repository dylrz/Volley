from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json
    # Perform your calculations here
    result = perform_calculations(data)
    return jsonify(result)


def perform_calculations(data):
    # Dummy calculation function
    return {"result": sum(data["numbers"])}


if __name__ == "__main__":
    app.run(port=5000)
