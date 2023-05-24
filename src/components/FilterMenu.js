import React from "react"

function FilterMenu(props) {
    if (props.show) { 
        const edges = props.data.map((text, index) => {
            return (
                <div>
                    <input type="checkbox" 
                            className="checkbox" 
                            id={`${text[0]}\u2192${text[1]}`} 
                            name={`${text[0]}\u2192${text[1]}`} 
                            defaultChecked={props.selected[`${text[0]}\u2192${text[1]}`]} 
                            onClick={() => props.toggleSelected(`${text[0]}\u2192${text[1]}`)}
                            />
                    <label for={`${text[0]}\u2192${text[1]}`}>{`${text[0]} \u2192 ${text[1]}`}</label>
                </div>
            );
        });

        return (
            <div className="filtermenu panel">
                {edges}
            </div>
        )
    } else {
        return <></>
    }
}

export default FilterMenu;