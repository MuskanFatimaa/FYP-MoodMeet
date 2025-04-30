import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.regularizers import l2
import os

# Step 1: Define the model architecture
def create_prompttts_model():
    model = Sequential()
    model.add(LSTM(128, return_sequences=True, activation='tanh', kernel_regularizer=l2(0.001), input_shape=(40, 1)))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))

    model.add(LSTM(64, return_sequences=False, activation='tanh', kernel_regularizer=l2(0.001)))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))

    model.add(Dense(64, activation='relu', kernel_regularizer=l2(0.001)))
    model.add(Dropout(0.3))
    model.add(Dense(5, activation='softmax'))

    return model


# Load model and weights
model = create_prompttts_model()
model.load_weights("prompttts_model.h5")
print("✅ PromptTTS weights loaded successfully!")

# Configure TFLite converter for LSTM support
converter = tf.lite.TFLiteConverter.from_keras_model(model)

# CRITICAL SETTINGS FOR LSTM CONVERSION
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,       # Standard TFLite ops
    tf.lite.OpsSet.SELECT_TF_OPS          # Required for LSTM support
]
converter._experimental_lower_tensor_list_ops = False  # Disable for LSTM

# Optional optimizations (can reduce model size)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.experimental_new_converter = True  # New converter often works better

# Convert and save
try:
    tflite_model = converter.convert()
    with open("prompttts_model.tflite", "wb") as f:
        f.write(tflite_model)
    print("✅ TFLite conversion successful!")
    
    # Verify the model can be loaded
    interpreter = tf.lite.Interpreter(model_path="prompttts_model.tflite")
    interpreter.allocate_tensors()
    print("✅ TFLite model verified and ready for deployment!")
    
except Exception as e:
    print(f"❌ Conversion failed: {str(e)}")
    print("\nAdditional troubleshooting steps:")
    print("1. Try with TensorFlow 2.6 or later")
    print("2. Simplify the model architecture if possible")
    print("3. Consider using tf.keras.layers.SimpleRNN instead of LSTM")