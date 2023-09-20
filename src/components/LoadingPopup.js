import React from 'react';
import Popup from 'reactjs-popup';

export default function LoadingPopup({isPopupOpen, togglePopup}) {
    return(
        <Popup open={isPopupOpen} overlayStyle={{ background: 'rgba(0, 0, 0, 0.6)', zIndex: 9999 }} animationType="fade" modal>
            {close => (
                <div className="no-sol-popup-container extra">
                    {/* <button className="close-x" onClick={close}>
                        &times;
                    </button> */}
                    <div className="header">
                        Loading...
                    </div>
                    <p className="popup-container-text">File is large: Please Wait...</p>
                </div>
            )}

        </Popup>
    );
}