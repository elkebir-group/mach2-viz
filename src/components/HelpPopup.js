import React from 'react';
import Popup from 'reactjs-popup';

export default function HelpPopup( {isPopupOpen, togglePopup}) {
    return(
        <Popup open={isPopupOpen} togglePopup={togglePopup} modal>
            {close => (
                <div className="popup-container">
                    <button className="close" onClick={close}>
                        &times;
                    </button>
                    <b><p>Help</p></b>
                    <p>Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.\n\nSelect different solutions from the dropdown on the top left of the panel.\n\nTo compare with another solution, click the [+] on the right. To view the solution space summary, click the [+] on the left.\n\nYou can return home by clicking the [X].</p>
                </div>
            )}

        </Popup>
    );
}
