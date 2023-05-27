import typer
import json
import signal

from sys import exit
from selenium import webdriver
from functools import partial

def main(
    input: str = typer.Option(..., "--input", "-i"),
    browser: str = typer.Option("chrome", "--browser", "-b")
):
    # Standardize browser input
    browser = browser.lower()

    # Select driver based on the argument
    if browser == "chrome":
        driver = webdriver.Chrome()
    elif browser == "firefox":
        driver = webdriver.Firefox()
    elif browser == "safari":
        driver = webdriver.Safari()
    elif browser == "edge":
        driver = webdriver.Edge()
    elif browser == "opera":
        driver = webdriver.Opera()
    elif browser == "explorer" or browser == "ie":
        driver = webdriver.Ie()
    else:
        raise ValueError("Invalid browser argument. Must choose from: chrome, firefox, safari, edge, opera, explorer or ie")
    
    # Load json data
    with open(input, 'r') as file:
        json_data = json.load(file)

    # Convert JSON to a string
    json_string = json.dumps(json_data)

    driver.get('https://elkebir-group.github.io/mach2-viz')

    driver.execute_script(f'''
        window.localStorage.setItem('json_data', {json_string})
    ''')

    while(True):
        pass

if __name__ == "__main__":
    typer.run(main)