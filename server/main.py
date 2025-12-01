import argparse
from flask import Flask
from flask_cors import CORS

from routes.cookie import cookie_bp

ASCII = """
███████████████████████████████████████████████████

    ██████  ██████   ██████  ██   ██  ██ ██████        
   ██      ██  ████ ██  ████ ██  ██  ███      ██       
   ██      ██ ██ ██ ██ ██ ██ █████    ██  █████        
   ██      ████  ██ ████  ██ ██  ██   ██      ██       
    ██████  ██████   ██████  ██   ██  ██ ██████        
                                                                                                        
██████  ██    ██ ███    ███ ██████  ██████  ██████  
██   ██ ██    ██ ████  ████ ██   ██      ██ ██   ██ 
██   ██ ██    ██ ██ ████ ██ ██████   █████  ██████  
██   ██ ██    ██ ██  ██  ██ ██           ██ ██   ██ 
██████   ██████  ██      ██ ██      ██████  ██   ██

███████████████████████████████████████████████████
v1.0.1 - server                            by N0M4D

"""

def main():
    parser = argparse.ArgumentParser()
    
    # server params
    parser.add_argument('--port', type=int)
    parser.add_argument('--static-folder', type=str)

    args = parser.parse_args()

    print(ASCII)
    print("Starting server...")
    print()
    
    app = create_app(args)
    app.run(port=args.port, debug=True, use_reloader=False)

def create_app(args):
    prefix = '/api'
    blueprints = [cookie_bp]

    app = Flask(__name__, static_folder=args.static_folder)
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.config["CUSTOM_ARGS"] = args

    # blueprint register
    for endpoint in blueprints:
        app.register_blueprint(endpoint, url_prefix=prefix)

    return app

if __name__ == "__main__":
    main()
