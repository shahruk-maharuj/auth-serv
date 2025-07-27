function welcome(name: string) {
    console.log('Hello');
    const user = {
        name: 'Shahruk',
    }
    const u1 = user.name;
    return `Welcome ${u1} ${name} to the world of TypeScript!`;

}

welcome('Shahruk');
