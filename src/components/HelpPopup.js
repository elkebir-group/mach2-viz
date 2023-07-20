import React from 'react';
import Popup from 'reactjs-popup';

export default function HelpPopup( {isPopupOpen, togglePopup}) {
    return(
        <Popup open={isPopupOpen} togglePopup={togglePopup} overlayStyle={{ background: 'rgba(0, 0, 0, 0.6)', zIndex: 9999 }} animationType="fade" modal>
            {close => (
                <div className="popup-container">
                    {/* <button className="close-x" onClick={close}>
                        &times;
                    </button> */}
                    <div className="header">
                        Help
                    </div>
                    <p className="popup-container-text">Click and drag around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.</p>
                    <p className="popup-container-text">Select different solutions from the dropdown on the top left of the panel.</p>
                    <p className="popup-container-text">To compare with another solution, click the [+] on the right. To view the solution space summary, click the [+] on the left.</p>

                    <button
                        className='close-button'
                        onClick={() => {
                        console.log('modal closed ');
                        togglePopup();
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

        </Popup>
    );
}
