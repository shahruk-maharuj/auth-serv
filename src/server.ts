function welcome(name: string) {
  console.log('Hello');
  const user = {
    name: 'Shahruk',
  };

  const fname = user.name;

  return name + fname;
}

welcome('Shahruk');
