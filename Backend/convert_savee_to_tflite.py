import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    LSTM, Dense, Dropout, 
    BatchNormalization, Bidirectional
)

def create_savee_model():
    model = Sequential()
    
    # First Bidirectional Layer - modified to match weight shapes
    model.add(Bidirectional(
        LSTM(128, return_sequences=True, activation='tanh'),
        input_shape=(32, 32)  # Changed to (32, 32) to match weight expectations
    ))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    
    # Second Bidirectional Layer
    model.add(Bidirectional(
        LSTM(64, return_sequences=False, activation='tanh')
    ))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    
    # Dense Layers
    model.add(Dense(64, activation='relu'))
    model.add(Dense(7, activation='softmax'))
    
    return model

# Load model and weights
model = create_savee_model()
model.load_weights("savee_model.h5")  # Make sure this path is correct
print("✅ Weights loaded successfully!")

# Configure TFLite converter for LSTM compatibility
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,       # Standard TFLite ops
    tf.lite.OpsSet.SELECT_TF_OPS          # Required for LSTM support
]
converter._experimental_lower_tensor_list_ops = False  # Disable for LSTM

# Optional optimizations (may help reduce model size)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# Convert and save
try:
    tflite_model = converter.convert()
    with open("savee_model.tflite", "wb") as f:
        f.write(tflite_model)
    print("✅ TFLite conversion successful!")
except Exception as e:
    print(f"❌ Conversion failed: {str(e)}")
    print("\nIf conversion still fails, try:")
    print("1. Using TensorFlow 2.6+ (better LSTM support)")
    print("2. Simplifying the model architecture")