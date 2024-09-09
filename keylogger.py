from pynput import keyboard, mouse
import threading
import time
import requests
import argparse

args_parser = argparse.ArgumentParser(description='Keylogger')
args_parser.add_argument('--api', type=str, required=True, help='API endpoint to push data to')
args = args_parser.parse_args()

api_endpoint = args.api

current_clicks = 0
mouse_left_clicks = 0
mouse_right_clicks = 0
mouse_scroll = 0

def push_current():
    global api_endpoint, current_clicks, mouse_left_clicks, mouse_right_clicks, mouse_scroll

    while True:
        if current_clicks == 0 and mouse_left_clicks == 0 and mouse_right_clicks == 0 and mouse_scroll == 0:
            continue
        
        clicks_to_push = current_clicks
        mouse_left_clicks_to_push = mouse_left_clicks
        mouse_right_clicks_to_push = mouse_right_clicks
        mouse_scroll_to_push = mouse_scroll

        current_clicks = 0
        mouse_left_clicks = 0
        mouse_right_clicks = 0
        mouse_scroll = 0

        json = {
            'keyboard_clicks': clicks_to_push,
            'mouse_left_clicks': mouse_left_clicks_to_push,
            'mouse_right_clicks': mouse_right_clicks_to_push,
            'mouse_scroll': mouse_scroll_to_push
        }

        print('Will push: {}'.format(json))
        try:
            requests.post(api_endpoint, json=json)
        except:
            print('Failed to push data to the API')
        time.sleep(1800)

thread = threading.Thread(target=push_current)
thread.start()

def on_release(key):
    global current_clicks
    current_clicks += 1
    # print('Current clicks: {}'.format(current_clicks))

def on_click(x, y, button, pressed):
    global mouse_left_clicks, mouse_right_clicks
    if pressed and button == mouse.Button.left:
        mouse_left_clicks += 1
    elif pressed and button == mouse.Button.right:
        mouse_right_clicks += 1
    # print('Left clicks: {}, Right clicks: {}'.format(mouse_left_clicks, mouse_right_clicks))
    
def on_scroll(x, y, dx, dy):
    global mouse_scroll
    mouse_scroll += 3
    # print('Scrolls: {}'.format(mouse_scroll))
    
keyboard_listener = keyboard.Listener(on_release=on_release)
mouse_listener = mouse.Listener(on_click=on_click, on_scroll=on_scroll)

keyboard_listener.start()
mouse_listener.start()