const profile = {
    template : `
    <div>
        <h3> Welcome {{email}}, having role {{role}} </h3>
    </div>
    `,
    data(){
        return{
            email : sessionStorage.getItem('email'),
            role : sessionStorage.getItem('role'),
            id : sessionStorage.getItem('id'),
        }
    },
};

export default profile;