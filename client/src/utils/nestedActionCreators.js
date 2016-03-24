import traverse from 'traverse';

export default function nestedActionCreators(actions, dispatch) {
    let actionsCopy = Object.assign({}, actions);

    traverse(actionsCopy).forEach(function (value) {
        if (this.isLeaf && typeof value === 'function') {
            this.update(function () {
                return dispatch(value());
            });
        }
    });

    return actionsCopy;
};
