import typer
import json
import platform

from selenium import webdriver
from shutil import which

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
    elif browser == "explorer" or browser == "ie":
        driver = webdriver.Ie()
    else:
        raise ValueError("Invalid browser argument. Must choose from: chrome, firefox, safari, edge, explorer or ie")
    
    # Load json data
    with open(input, 'r') as file:
        json_data = json.load(file)
        labels = [solution["name"] for solution in json_data["solutions"]]


    # Convert JSON to a string
    json_string = json.dumps(json_data)

    # Open the webpage and set the data in localstorage
    driver.get('https://elkebir-group.github.io/mach2-viz')
    driver.execute_script(f"window.localStorage.setItem('json_data', '{json_string}')")
    driver.get(f'https://elkebir-group.github.io/mach2-viz/#/mach2-viz/viz?labeling={labels[0]}')

    while(True):
        pass

if __name__ == "__main__":
    typer.run(main)