import ReactDOM from 'react-dom';

const PopupWrapperWithPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};

export default PopupWrapperWithPortal;
