import typer
import json
import builtins

from selenium import webdriver

def main(
    input: str = typer.Option(..., "--input", "-i"),
    browser: str = typer.Option("chrome", "--browser", "-b")
):
    # Standardize browser input
    browser = browser.lower()

    # Select driver based on the argument
    if browser == "chrome":
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_experimental_option("detach", True)      # Keep browser open when script closes
        driver = webdriver.Chrome(options=chrome_options)
    elif browser == "firefox":
        firefox_options = webdriver.FirefoxOptions()
        firefox_options.add_experimental_option("detach", True)
        driver = webdriver.Firefox(options=firefox_options)
    elif browser == "safari":
        driver = webdriver.Safari()
    elif browser == "edge":
        edge_options = webdriver.EdgeOptions()
        edge_options.add_experimental_option("detach", True)
        driver = webdriver.Edge(options=edge_options)
    elif browser == "explorer" or browser == "ie":
        ie_options = webdriver.IeOptions()
        ie_options.add_experimental_option("detach", True)
        driver = webdriver.Ie(options=ie_options)
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
    driver.execute_script(f"window.sessionStorage.setItem('json_data', '{json_string}')")
    driver.get(f'https://elkebir-group.github.io/mach2-viz/#/mach2-viz/viz?labeling={labels[0]}')

    if browser == 'safari':
        print("Press ENTER to continue...")
        builtins.input()

if __name__ == "__main__":
    typer.run(main)