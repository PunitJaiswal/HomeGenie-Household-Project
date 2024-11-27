const home = {
    template: `
    <div class='home'>
        <h1> Welcome to HomeGenie </h1>
        <br>
        <p style='font-size:20px;'> Connecting you with trusted professionals for your household needs. </p>
        <br><br>
        <button class='reg-btn'><router-link to='/Login'>Login</router-link></button>
        <br><br><br>
        <button class='reg-btn'><router-link to='/signup'>Signup</router-link></button>
    </div>
    `,   
}

export default home;