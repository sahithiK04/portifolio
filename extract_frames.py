import cv2
import numpy as np
import os

video_path = 'public/character.mp4_1080p_20261001234653.mp4'
if not os.path.exists(video_path):
    video_path = 'character.mp4_1080p_20261001234653.mp4'
if not os.path.exists(video_path):
    video_path = 'public/character.mp4'

mask_path = 'public/star_perfect_mask.png'
if not os.path.exists(mask_path):
    mask_path = 'star_perfect_mask.png'

print(f"Reading video from: {video_path}")
print(f"Reading exact star mask from: {mask_path}")

os.makedirs('public/frames', exist_ok=True)
os.makedirs('frames', exist_ok=True)

# 100x100 mask targeting the exact 4-pointed Gemini watermark at y: [871, 971], x: [1689, 1789]
star_mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

def remove_gemini_watermark(frame):
    # Only inpaint the exact 100x100 box where the 4-point star is located
    box = frame[871:971, 1689:1789]
    cleaned_box = cv2.inpaint(box, star_mask, 5, cv2.INPAINT_TELEA)
    frame[871:971, 1689:1789] = cleaned_box
    return frame

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Total video frames: {total_frames}")

# Extract and clean center neutral frame (Frame 235)
cap.set(cv2.CAP_PROP_POS_FRAMES, 235)
ret, center_frame = cap.read()
if ret:
    center_frame = remove_gemini_watermark(center_frame)
    cv2.imwrite('public/center.webp', center_frame, [cv2.IMWRITE_WEBP_QUALITY, 92])
    cv2.imwrite('public/frames/center.webp', center_frame, [cv2.IMWRITE_WEBP_QUALITY, 92])
    cv2.imwrite('frames/center.webp', center_frame, [cv2.IMWRITE_WEBP_QUALITY, 92])
    cv2.imwrite('public/character.jpg', center_frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print("Saved clean 1080p center.webp and character.jpg without Gemini watermark")

frames_64_mapping = []
bridge_map = [206, 208, 210, 212, 31, 35, 38, 42, 45]

for i in range(64):
    if i <= 8:
        vf = int(round(np.interp(i, [0, 8], [86, 110])))
    elif i <= 16:
        vf = int(round(np.interp(i, [8, 16], [110, 138])))
    elif i <= 24:
        vf = int(round(np.interp(i, [16, 24], [138, 160])))
    elif i <= 32:
        vf = int(round(np.interp(i, [24, 32], [160, 182])))
    elif i <= 40:
        vf = int(round(np.interp(i, [32, 40], [182, 206])))
    elif i <= 48:
        vf = bridge_map[i - 40]
    elif i <= 56:
        vf = int(round(np.interp(i, [48, 56], [45, 67])))
    else:
        vf = int(round(np.interp(i, [56, 64], [67, 86])))
    frames_64_mapping.append((i, vf))

print("Extracting and cleaning 64 frames with exact star inpainting...")
for idx, vf in frames_64_mapping:
    cap.set(cv2.CAP_PROP_POS_FRAMES, vf)
    ret, frame = cap.read()
    if ret:
        frame = remove_gemini_watermark(frame)
        cv2.imwrite(f'public/frames/frame_{idx}.webp', frame, [cv2.IMWRITE_WEBP_QUALITY, 90])
        cv2.imwrite(f'frames/frame_{idx}.webp', frame, [cv2.IMWRITE_WEBP_QUALITY, 90])
    else:
        print(f"Warning: Failed to read frame {vf} for index {idx}")

cap.release()
print("All 1080p frames extracted and completely cleaned of the Gemini watermark!")
