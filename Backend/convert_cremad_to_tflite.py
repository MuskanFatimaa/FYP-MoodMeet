import tensorflow as tf
from tensorflow.keras.models import load_model
import h5py
import numpy as np

def verify_model_weights(model_path):
    """Verify the structure of the saved model file"""
    try:
        with h5py.File(model_path, 'r') as f:
            if 'model_weights' in f:
                print("✅ Model weights structure:")
                print(list(f['model_weights'].keys()))
            elif 'keras_version' in f:
                print("✅ Found full saved model (not just weights)")
            else:
                print("⚠️ Unexpected file structure")
    except Exception as e:
        print(f"❌ Error inspecting file: {e}")

def convert_crema_model():
    try:
        # First try loading the complete model
        print("Attempting to load full model...")
        model = load_model("crema_model.h5")
        print("✅ Full model loaded successfully!")
    except:
        print("⚠️ Couldn't load full model, trying weights-only approach...")
        try:
            # Recreate the exact architecture
            input_layer = tf.keras.Input(shape=(200, 26))
            
            # Convolutional Blocks
            x = tf.keras.layers.Conv1D(128, 3, padding='same', activation='relu')(input_layer)
            x = tf.keras.layers.BatchNormalization()(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Dropout(0.2)(x)
            
            x = tf.keras.layers.Conv1D(128, 3, padding='same', activation='relu')(x)
            x = tf.keras.layers.BatchNormalization()(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Dropout(0.2)(x)
            
            x = tf.keras.layers.Conv1D(256, 3, padding='same', activation='relu')(x)
            x = tf.keras.layers.BatchNormalization()(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Dropout(0.2)(x)
            
            # Bidirectional LSTM
            x = tf.keras.layers.Bidirectional(
                tf.keras.layers.LSTM(128, return_sequences=True))(x)
            x_norm = tf.keras.layers.LayerNormalization()(x)
            
            # Attention Block
            attention = tf.keras.layers.MultiHeadAttention(num_heads=4, key_dim=64)
            attn_out = attention(x_norm, x_norm)
            x = tf.keras.layers.Dense(256)(attn_out)
            x = tf.keras.layers.Add()([x_norm, x])
            x = tf.keras.layers.LayerNormalization()(x)
            
            # Classifier
            x = tf.keras.layers.GlobalMaxPooling1D()(x)
            x = tf.keras.layers.Dense(128, activation='relu')(x)
            x = tf.keras.layers.Dropout(0.3)(x)
            x = tf.keras.layers.Dense(64, activation='relu')(x)
            x = tf.keras.layers.Dropout(0.3)(x)
            outputs = tf.keras.layers.Dense(6, activation='softmax')(x)
            
            model = tf.keras.Model(inputs=input_layer, outputs=outputs)
            
            # Load weights with explicit by_name=True
            model.load_weights("crema_model.h5", by_name=True)
            print("✅ Weights loaded successfully with by_name=True")
            
        except Exception as e:
            print(f"❌ Failed to load weights: {e}")
            print("\nPossible solutions:")
            print("1. The model architecture doesn't match the saved weights")
            print("2. The file might be corrupted")
            print("3. Try retraining the model")
            return None
    
    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS  # Needed for MultiHeadAttention
    ]
    converter._experimental_lower_tensor_list_ops = False
    
    try:
        tflite_model = converter.convert()
        with open("crema_model.tflite", "wb") as f:
            f.write(tflite_model)
        print("✅ TFLite conversion successful!")
    except Exception as e:
        print(f"❌ TFLite conversion failed: {e}")

# First inspect the model file
print("Inspecting model file...")
verify_model_weights("crema_model.h5")

# Then attempt conversion
print("\nStarting conversion process...")
convert_crema_model()