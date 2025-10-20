from dotenv import load_dotenv
load_dotenv()

from backend import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 3002))
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
