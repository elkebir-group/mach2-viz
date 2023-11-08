import React from 'react';
import Popup from 'reactjs-popup';

export default function NoSolutionsPopup({isPopupOpen, togglePopup}) {
    return(
        <Popup open={isPopupOpen} onClose={togglePopup} overlayStyle={{ background: 'rgba(0, 0, 0, 0.6)', zIndex: 9999 }} animationType="fade" modal>
            {close => (
                <div className="no-sol-popup-container">
                    {/* <button className="close-x" onClick={close}>
                        &times;
                    </button> */}
                    <div className="header">
                        ERROR
                    </div>
                    <p className="popup-container-text">There are no solutions available for your input!</p>

                    <button
                        className='close-button'
                        onClick={close}
                    >
                        Close
                    </button>
                </div>
            )}

        </Popup>
    );
}