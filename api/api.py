import datetime
import random
import time
import os
from flask import request, jsonify, Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/solar")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
#CORS(app)

class SolarPowerPlant(db.Model):
    __tablename__ = 'power_plant'

    plant_id = db.Column(db.Integer, primary_key=True)
    plant_name = db.Column(db.String(255))
    latitude = db.Column(db.String(255))
    longitude = db.Column(db.String(255))
    capacity_mw = db.Column(db.Float)
    num_panels = db.Column(db.Integer)
    panel_height = db.Column(db.Float)
    panel_width = db.Column(db.Float)
    total_panel_surface = db.Column(db.Float)
    panel_efficiency = db.Column(db.Float)
    system_efficiency = db.Column(db.Float)
    total_surface_and_efficiency = db.Column(db.Float)
    power_dependence_on_temperature_related_to_25_celsius = db.Column(db.Float)
    max_installed_capacity = db.Column(db.Float)
    status = db.Column(db.Boolean)
    models = db.Column(db.Integer)
    current_production = db.Column(db.Float)
    utilization = db.Column(db.Float)

    def __init__(self, plant_name, capacity_mw, num_panels=None, panel_height=None, panel_width=None, total_panel_surface=None, panel_efficiency=None, system_efficiency=None, total_surface_and_efficiency=None, power_dependence_on_temperature_related_to_25_celsius=None, max_installed_capacity=None, latitude=None, longitude=None, current_production=None, utilization=None):
        self.plant_name = plant_name
        self.latitude = latitude
        self.longitude = longitude
        self.capacity_mw = capacity_mw
        self.num_panels = num_panels
        self.panel_height = panel_height
        self.panel_width = panel_width
        self.total_panel_surface = total_panel_surface
        self.panel_efficiency = panel_efficiency
        self.system_efficiency = system_efficiency
        self.total_surface_and_efficiency = total_surface_and_efficiency
        self.power_dependence_on_temperature_related_to_25_celsius = power_dependence_on_temperature_related_to_25_celsius
        self.max_installed_capacity = max_installed_capacity
        self.current_production = current_production
        self.utilization = utilization

class Model(db.Model):
    __tablename__ = 'models'

    model_id = db.Column(db.String(120), primary_key=True)
    model_name = db.Column(db.String(255))
    description = db.Column(db.Text)
    plant_id = db.Column(db.Integer, db.ForeignKey('power_plant.plant_id'))
    accuracy = db.Column(db.Integer)
    status = db.Column(db.String(255))
    type = db.Column(db.String(255))
    best = db.Column(db.Boolean)

    def __init__(self, model_id, model_name, description, plant_id):
        self.model_id = model_id
        self.model_name = model_name
        self.description = description
        self.plant_id = plant_id

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('models.model_id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    datetime = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(255), nullable=True)  

    def __init__(self, model_id, status, datetime, description=None):
        self.model_id = model_id
        self.status = status
        self.datetime = datetime
        self.description = description

    def __repr__(self):
        return f"<Event(model_id={self.model_id}, status={self.status}, datetime={self.datetime}, description={self.description})>"


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False) 
    avatar_url = db.Column(db.String(255))
    role = db.Column(db.String(50))
    active = db.Column(db.Boolean())
    created_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, full_name, email, username, avatar_url, role, created_at, active):
        self.full_name = full_name
        self.email = email
        self.username = username
        self.avatar_url = avatar_url
        self.role = role
        self.created_at = created_at
        self.active = active

@app.route('/users', methods=['GET'])
def get_users():
    search = request.args.get('search')
    role = request.args.get('role')

    query = User.query

    if search:
        query = query.filter(
            User.full_name.ilike(f'%{search}%') |
            User.email.ilike(f'%{search}%') |
            User.username.ilike(f'%{search}%') 
        )
    if role:
        query = query.filter_by(role=role)

    users = query.all()
    result = [
        {
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'username': user.username,  
            'avatar_url': user.avatar_url,
            'role': user.role,
            'created_at': user.created_at.isoformat(),
            'status': user.active
        }
        for user in users
    ]
    return jsonify(result)

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'username': user.username, 
        'avatar_url': user.avatar_url,
        'role': user.role,
        'created_at': user.created_at.isoformat(),
        'active': user.active
    })

@app.route('/users/roles', methods=['GET'])
def get_roles():
    return jsonify([
        {"label": "Admin", "value": "admin"},
        {"label": "Editor", "value": "editor"},
        {"label": "Viewer", "value": "viewer"}
    ])    

@app.route('/upload', methods=['POST'])
def post_upload():
    return jsonify({"url": "https://i.pravatar.cc/300"})  

@app.route('/power_plants', methods=['GET'])
def get_power_plants():
    power_plants = SolarPowerPlant.query.all()
    result = [
        {
            'plant_id': plant.plant_id,
            'plant_name': plant.plant_name,
            'latitude': plant.latitude,
            'longitude': plant.longitude,
            'capacity_mw': plant.capacity_mw,
            'num_panels': plant.num_panels,
            'panel_height': plant.panel_height,
            'panel_width': plant.panel_width,
            'total_panel_surface': plant.total_panel_surface,
            'panel_efficiency': plant.panel_efficiency,
            'system_efficiency': plant.system_efficiency,
            'total_surface_and_efficiency': plant.total_surface_and_efficiency,
            'power_dependence_on_temperature_related_to_25_celsius': plant.power_dependence_on_temperature_related_to_25_celsius,
            'max_installed_capacity': plant.max_installed_capacity,
            'status': plant.status,
            'models': plant.models,
            'current_production': plant.current_production,
            'utilization': plant.utilization
        }
        for plant in power_plants
    ]
    return jsonify(result)

@app.route('/power_plants/<int:plant_id>', methods=['GET'])
def get_power_plant(plant_id):
    plant = SolarPowerPlant.query.get_or_404(plant_id)
    return jsonify({
        'plant_id': plant.plant_id,
        'plant_name': plant.plant_name,
        'latitude': plant.latitude,
        'longitude': plant.longitude,
        'capacity_mw': plant.capacity_mw,
        'num_panels': plant.num_panels,
        'panel_height': plant.panel_height,
        'panel_width': plant.panel_width,
        'total_panel_surface': plant.total_panel_surface,
        'panel_efficiency': plant.panel_efficiency,
        'system_efficiency': plant.system_efficiency,
        'total_surface_and_efficiency': plant.total_surface_and_efficiency,
        'power_dependence_on_temperature_related_to_25_celsius': plant.power_dependence_on_temperature_related_to_25_celsius,
        'max_installed_capacity': plant.max_installed_capacity,
        'status': plant.status,
        'models': plant.models,
        'current_production': plant.current_production,
        'utilization': plant.utilization,
        'custom_parameters': [
            {'name': 'Mock string', 'type': 'string', 'value': 'test'},
            {'name': 'Mock number', 'type': 'number', 'value': '1'},
            {'name': 'Mock string', 'type': 'boolean', 'value': 'true'}
        ],
    })

@app.route('/models', methods=['GET'])
def get_models():
    plant_id = request.args.get('plant_id')

    if plant_id:
        models = Model.query.filter_by(plant_id=plant_id).all()
    else:
        models = Model.query.all()

    result = [
        {
            'model_id': model.model_id,
            'model_name': model.model_name,
            'description': model.description,
            'plant_id': model.plant_id,
            'accuracy': model.accuracy,
            'status': model.status,
            'model_type': model.type,
            'best': model.best
        }
        for model in models
    ]

    return jsonify(result)

@app.route('/models/<string:model_id>', methods=['GET'])
def get_model(model_id):
    model = Model.query.get_or_404(model_id)
    return jsonify({
        'model_id': model.model_id,
        'model_name': model.model_name,
        'description': model.description,
        'plant_id': model.plant_id,
        'plant_name': 'SE Vis',
        'accuracy': model.accuracy,
        'best': model.best,
        'type': model.type,
        'status': model.status,
        'parameters': ['temperature', 'humidity', 'wind-speed'],
        'custom_parameters': [
            {'name': 'Mock string', 'type': 'string', 'value': 'test'},
            {'name': 'Mock number', 'type': 'number', 'value': '1'},
            {'name': 'Mock boolean', 'type': 'boolean', 'value': 'true'}
        ],
        'metrics': [
            {'name': 'F1 Score', 'abbr': 'F1', 'value': 0.85, 'unit': ''},
            {'name': 'Mean Absolute Error', 'abbr': 'MAE', 'value': 0.5, 'unit': 'kW'},
            {'name': 'Root Mean Squared Error', 'abbr': 'RMSE', 'value': 0.75, 'unit': 'kW'},
            {'name': 'R-squared', 'abbr': 'R²', 'value': 0.89, 'unit': ''}
        ],
        'options': {'enabled': True, 'auto': True, 'run_times': ['2025-01-14T21:45:49.900Z']},
        'metrics_updated': datetime.datetime.now().isoformat(),
        'last_run': datetime.datetime.now().isoformat()
    })

@app.route('/power_plants', methods=['POST'])
def create_power_plant():
    data = request.get_json()
    new_plant = SolarPowerPlant(
        plant_name=data['plant_name'],
        location=data['location'],
        capacity_mw=data['capacity_mw'],
        num_panels=data.get('num_panels'),
        panel_height=data.get('panel_height'),
        panel_width=data.get('panel_width'),
        total_panel_surface=data.get('total_panel_surface'),
        panel_efficiency=data.get('panel_efficiency'),
        system_efficiency=data.get('system_efficiency'),
        total_surface_and_efficiency=data.get('total_surface_and_efficiency'),
        power_dependence_on_temperature_related_to_25_celsius=data.get('power_dependence_on_temperature_related_to_25_celsius'),
        max_installed_capacity=data.get('max_installed_capacity')
    )
    db.session.add(new_plant)
    db.session.commit()
    return jsonify({
        'message': 'New power plant created',
        'plant_id': new_plant.plant_id
    }), 201

@app.route('/models', methods=['POST'])
def create_model():
    data = request.get_json()
    new_model = Model(
        model_id=data['model_id'],
        model_name=data['model_name'],
        description=data['description'],
        plant_id=data['plant_id']
    )
    db.session.add(new_model)
    db.session.commit()
    return jsonify({
        'message': 'New model created',
        'model_id': new_model.model_id
    }), 201

@app.route('/power_plants/<int:plant_id>', methods=['PUT'])
def update_power_plant_full(plant_id):
    plant = SolarPowerPlant.query.get_or_404(plant_id)
    data = request.get_json()

    plant.plant_name = data['plant_name']
    plant.location = data['location']
    plant.capacity_mw = data['capacity_mw']
    plant.num_panels = data['num_panels']
    plant.panel_height = data['panel_height']
    plant.panel_width = data['panel_width']
    plant.total_panel_surface = data['total_panel_surface']
    plant.panel_efficiency = data['panel_efficiency']
    plant.system_efficiency = data['system_efficiency']
    plant.total_surface_and_efficiency = data['total_surface_and_efficiency']
    plant.power_dependence_on_temperature_related_to_25_celsius = data['power_dependence_on_temperature_related_to_25_celsius']
    plant.max_installed_capacity = data['max_installed_capacity']

    db.session.commit()

    return jsonify({
        'message': f'Power plant with id {plant_id} has been updated',
        'plant_id': plant.plant_id
    }), 200

@app.route('/models/<string:model_id>', methods=['PUT'])
def update_model_full(model_id):
    model = Model.query.get_or_404(model_id)
    data = request.get_json()

    model.model_name = data['model_name']
    model.description = data['description']
    model.plant_id = data['plant_id']

    db.session.commit()

    return jsonify({
        'message': f'Model with id {model_id} has been updated',
        'model_id': model.model_id
    }), 200

@app.route('/power_plants/<int:plant_id>', methods=['PATCH'])
def update_power_plant(plant_id):
    plant = SolarPowerPlant.query.get_or_404(plant_id)
    data = request.get_json()

    if 'plant_name' in data:
        plant.plant_name = data['plant_name']
    if 'location' in data:
        plant.location = data['location']
    if 'capacity_mw' in data:
        plant.capacity_mw = data['capacity_mw']
    if 'num_panels' in data:
        plant.num_panels = data['num_panels']
    if 'panel_height' in data:
        plant.panel_height = data['panel_height']
    if 'panel_width' in data:
        plant.panel_width = data['panel_width']
    if 'total_panel_surface' in data:
        plant.total_panel_surface = data['total_panel_surface']
    if 'panel_efficiency' in data:
        plant.panel_efficiency = data['panel_efficiency']
    if 'system_efficiency' in data:
        plant.system_efficiency = data['system_efficiency']
    if 'total_surface_and_efficiency' in data:
        plant.total_surface_and_efficiency = data['total_surface_and_efficiency']
    if 'power_dependence_on_temperature_related_to_25_celsius' in data:
        plant.power_dependence_on_temperature_related_to_25_celsius = data['power_dependence_on_temperature_related_to_25_celsius']
    if 'max_installed_capacity' in data:
        plant.max_installed_capacity = data['max_installed_capacity']

    db.session.commit()

    return jsonify({
        'plant_id': plant.plant_id,
        'plant_name': plant.plant_name,
        'location': plant.location,
        'capacity_mw': plant.capacity_mw,
        'num_panels': plant.num_panels,
        'panel_height': plant.panel_height,
        'panel_width': plant.panel_width,
        'total_panel_surface': plant.total_panel_surface,
        'panel_efficiency': plant.panel_efficiency,
        'system_efficiency': plant.system_efficiency,
        'total_surface_and_efficiency': plant.total_surface_and_efficiency,
        'power_dependence_on_temperature_related_to_25_celsius': plant.power_dependence_on_temperature_related_to_25_celsius,
        'max_installed_capacity': plant.max_installed_capacity,
        'utilization': plant.utilization,
        'current_production': plant.current_production,
        'status': plant.status
    })

@app.route('/models/<string:model_id>', methods=['PATCH'])
def update_model(model_id):
    model = Model.query.get_or_404(model_id)
    data = request.get_json()

    if 'model_name' in data:
        model.model_name = data['model_name']
    if 'description' in data:
        model.description = data['description']
    if 'plant_id' in data:
        model.plant_id = data['plant_id']

    db.session.commit()

    return jsonify({
        'model_id': model.model_id,
        'model_name': model.model_name,
        'description': model.description,
        'plant_id': model.plant_id
    }), 200

@app.route('/power_plants/<int:plant_id>', methods=['DELETE'])
def delete_power_plant(plant_id):
    plant = SolarPowerPlant.query.get_or_404(plant_id)
    db.session.delete(plant)
    db.session.commit()
    return jsonify({'message': f'Power plant with id {plant_id} has been deleted.'}), 200

@app.route('/models/<string:model_id>', methods=['DELETE'])
def delete_model(model_id):
    model = Model.query.get_or_404(model_id)
    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': f'Model with id {model_id} has been deleted.'}), 200

def generate_mock_power_data(start_day, days, name, type, resource="plant"):
    forecast = []
    current_time = datetime.datetime.now()
    
    for day_offset in range(days):
        forecast_day = start_day + datetime.timedelta(days=day_offset)
        
        for hour in range(24):
            forecast_datetime = datetime.datetime.combine(forecast_day, datetime.time(hour))
            
            if name.lower() == "production" and forecast_datetime > current_time:
                break

            if 6 <= hour <= 18:
                production = abs(round(1000 * max(0, -((hour - 12) ** 2) / 36 + 1)) + random.randint(-100, 50))
            else:
                production = 0

            forecast.append({
                "date": f"{forecast_datetime.date()}T{hour:02}:00:00",
                "value": production,
                resource: name,
                "type": type,
                "measurement_unit": "kW"
            })
    
    return forecast

@app.route('/dashboard/production_data', methods=['GET'])
def get_production():
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)

    plants = ["SE Vis", "SE Drava", "SE Kaštelir"]

    production_data = []
    for plant in plants:
        production_data.extend(generate_mock_power_data(yesterday, 1, plant, "production"))

    forecast_data = []
    for plant in plants:
        forecast_data.extend(generate_mock_power_data(today, 3, plant, "forecast"))

    all_data = production_data + forecast_data

    return jsonify(all_data)

@app.route('/dashboard/plant_overview', methods=['GET'])
def get_plants_map():
    plants = [
        {
            "id": 1,
            "name": "SE Vis",
            "coordinates": {"lat": 43.03823574273269, "lng": 16.150850402782556},
            "current_production": 0.82, 
            "installed_capacity": 1.44,  
            "utilization_percentage": round((8.5 / 15.0) * 100, 0),
            "measurement_unit": "MW",
        },
        {
            "id": 2,
            "name": "SE Drava",
            "coordinates": {"lat": 45.52121150403985, "lng": 18.664564092580623},
            "current_production": 0.58, 
            "installed_capacity": 0.98,  
            "utilization_percentage": round((0.58 / 0.98) * 100, 0), 
            "measurement_unit": "MW",
        },
        {
            "id": 3,
            "name": "SE Kaštelir",
            "coordinates": {"lat": 45.328141, "lng": 13.675503},
            "current_production": 0.49,  
            "installed_capacity": 1, 
            "utilization_percentage": round((0.49 / 1) * 100, 0), 
            "measurement_unit": "MW",
        }
    ]
    today = datetime.date.today()
    for plant in plants:
        plant_name = plant["name"]
        plant["forecast"] = generate_mock_power_data(today, 1, plant_name, "forecast")
    
    return jsonify(plants)

@app.route('/events', methods=['GET'])
def get_events():
    model_id = request.args.get('model_id', type=int)

    query = Event.query

    if model_id:
        query = query.filter(Event.model_id == model_id)

    events = query.all()

    result = [
        {
            'id': event.id,
            'model_id': event.model_id,
            'status': event.status,
            'datetime': event.datetime,
            'description': event.description
        }
        for event in events
    ]

    return jsonify(result)

@app.route('/models/weather_params', methods=['GET'])
def get_selections():
    return jsonify([
        {"label": "Temperature", "value": "temperature"},
        {"label": "Humidity", "value": "humidity"},
        {"label": "Wind Speed", "value": "wind-speed"},
        {"label": "Cloud Cover", "value": "cloud-cover"},
        {"label": "Precipitation", "value": "precipitation"},
        {"label": "Air Pressure", "value": "air-pressure"},
        {"label": "UV Index", "value": "uv-index"}
    ])

@app.route('/models/run', methods=['POST'])
def run_model():
    return jsonify('success')

@app.route('/forecasts/<int:plant_id>', methods=['GET'])
def get_forecasts(plant_id):
    start_str = request.args.get('start')
    end_str = request.args.get('end')
    
    if not start_str or not end_str:
        start_date = datetime.datetime.now().date()
        end_date = start_date + datetime.timedelta(days=3)
    else:
        start_date = datetime.datetime.fromisoformat(start_str.replace('T', ' '))
        end_date = datetime.datetime.fromisoformat(end_str.replace('T', ' '))

    num_days = (end_date - start_date).days + 1
    num_days = (end_date - start_date).days + 1
    data = []
    sources = ['Model A', 'Model B', 'Production']
    for source in sources:
        data.extend(generate_mock_power_data(start_date, num_days, source, "", "source"))
    return jsonify(data)

def generate_mock_metric_data(start_day, days, name, metric="accuracy", resource="model"):
    forecast = []
    current_time = datetime.datetime.now()

    for day_offset in range(days):
        forecast_day = start_day + datetime.timedelta(days=day_offset)

        for hour in range(24):
            forecast_datetime = datetime.datetime.combine(forecast_day, datetime.time(hour))

            if forecast_datetime > current_time:
                break

            if 6 <= hour <= 18:
                metric_value = round(90 + random.uniform(-5, 5), 2)
            else:
                metric_value = round(98 + random.uniform(-1, 2), 2)

            forecast.append({
                "date": f"{forecast_datetime.date()}T{hour:02}:00:00",
                "value": metric_value,
                resource: name,
                "metric": metric,
                "measurement_unit": "%"
            })

    return forecast

@app.route('/metrics/<int:model_id>', methods=['GET'])
def get_metrics(model_id):
    start_str = request.args.get('start')
    end_str = request.args.get('end')
    metric = request.args.get('metric', 'accuracy') 
    other_models = request.args.getlist('other_models')

    if not start_str or not end_str:
        start_date = datetime.datetime.now().date()
        end_date = start_date + datetime.timedelta(days=3)
    else:
        start_date = datetime.datetime.fromisoformat(start_str.replace('T', ' '))
        end_date = datetime.datetime.fromisoformat(end_str.replace('T', ' '))

    num_days = (end_date - start_date).days + 1

    data = generate_mock_metric_data(start_date, num_days, "Model", metric, "model")

    if other_models:
        for other_model_id in other_models:
            if other_model_id:
                data.extend(generate_mock_metric_data(start_date, num_days, "Model" + other_model_id, metric, "model"))

    return jsonify(data)

@app.route('/metrics/available', methods=['GET'])
def get_available_metrics():
    return jsonify([
        {"label": "Accuracy", "value": "accuracy"},
        {"label": "Precision", "value": "precision"},
        {"label": "Recall", "value": "recall"},
        {"label": "F1 Score", "value": "f1_score"},
    ])


@app.route('/health', methods=['GET'])
def health():
    return "UI API is healthy"

@app.before_request
def add_delay():
    time.sleep(0.2)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0" ,port=os.environ.get("PORT", "8000"))
