import tensorflow as tf
import numpy as np

# Load models (update paths if needed)
MODEL_PATHS = {
    "cremad": "crema_model.tflite",
    "savee": "savee_model.tflite",
    "prompttts": "prompttts_model.tflite"
}

# Initialize interpreters
interpreters = {}
for name, path in MODEL_PATHS.items():
    interpreters[name] = tf.lite.Interpreter(model_path=path)
    interpreters[name].allocate_tensors()

# Print input details
print("=== Model Input Details ===")
for name, interpreter in interpreters.items():
    input_details = interpreter.get_input_details()[0]
    print(f"\nModel: {name}")
    print(f"  - Shape: {input_details['shape']}")
    print(f"  - Dtype: {input_details['dtype']}")
    print(f"  - Name: {input_details['name']}")