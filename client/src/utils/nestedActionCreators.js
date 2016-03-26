// import traverse from 'traverse';
import { bindActionCreators } from 'redux';

export default function nestedActionCreators(actions, dispatch) {
    let actionsCopy = {};

    Object.keys(actions).forEach(key => {
        actionsCopy[key] = bindActionCreators(actions[key], dispatch);
    });
    //
    // traverse(actionsCopy).forEach(function (value) {
    //     if (this.isLeaf && typeof value === 'function') {
    //         this.update(function (...args) {
    //             return dispatch(value.apply(undefined, arguments));
    //         });
    //     }
    // });
    //
    return actionsCopy;
};
