from dotenv import load_dotenv
load_dotenv()

from backend import create_app

app = create_app()

if __name__ == '__main__':
    app.run(port=5002, debug=True)
