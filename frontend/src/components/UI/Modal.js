import React,{Fragment} from 'react';
import classes from './Modal.module.css';
import { useNavigate } from 'react-router-dom';
import ReactDom from 'react-dom';

const Backdrop = (props) => {
    return (
        <div className={classes.backdrop}></div>
    )
}
const ModalOverlay = (props) => {
    const navigate = useNavigate();
    return (
        <div className={classes.modal}>
            <p onClick={() => navigate(-1)} className={classes.right}>X</p>
            <div className={classes.content}>{props.children}</div>
        </div>
    )
}
const portalElement = document.getElementById("overlays");
const Modal=(props)=>{
    return (
        <Fragment>
            {ReactDom.createPortal(<Backdrop />,portalElement)}
            {ReactDom.createPortal(<ModalOverlay>{props.children}</ModalOverlay>,portalElement)}
            
      </Fragment>
    
  )
}

export default Modal