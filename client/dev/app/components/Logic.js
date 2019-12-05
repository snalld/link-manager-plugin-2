export const If = ({ condition }, children) => (!!condition ? children : null);
export const IfElse = ({ condition }, [pass, fail]) => (!!condition ? pass : fail);
