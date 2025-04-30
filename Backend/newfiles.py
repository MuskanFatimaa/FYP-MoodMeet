import tensorflow as tf
import os

model_files = [
    "crema_model.h5",
    "savee_model.h5",
    "prompttts_model.h5"
]

base_path = os.path.dirname(os.path.abspath(__file__))  # This points to FYP-master/Backend

for model_name in model_files:
    model_path = os.path.join(base_path, model_name)
    print(f"Converting: {model_path}")
    
    try:
        # Load the model
        model = tf.keras.models.load_model(model_path, compile=False)
        
        # Manually change the input layer to avoid batch_shape issues
        new_input_layer = tf.keras.layers.Input(shape=model.input.shape[1:])  # Remove batch_size
        new_model = tf.keras.models.Model(inputs=new_input_layer, outputs=model.output)
        
        # Convert the modified model to TFLite format
        tflite_model = tf.lite.TFLiteConverter.from_keras_model(new_model).convert()
        
        # Save the converted model
        with open(os.path.join(base_path, model_name.replace(".h5", ".tflite")), "wb") as f:
            f.write(tflite_model)
        
        print(f"Successfully converted {model_name}")
    except Exception as e:
        print(f"Failed to convert {model_name}: {e}")
