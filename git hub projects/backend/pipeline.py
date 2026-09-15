from backend.synchronization import synchronize
from backend.features import calculate_features

def process_observation(sensor_data, aircraft_data, history):
    synchronized = synchronize(sensor_data, aircraft_data)
    if synchronized is None:
        return None

    previous = history[-1] if len(history) > 0 else None
    features = calculate_features(synchronized, previous)

    history.append(synchronized)
    if len(history) > 10:
        history.pop(0)

    return features
