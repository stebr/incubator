# FormFor Component

FormFor is a `can.Component` that allows declarative building of the forms that can handle complex data structures. It uses `can-value` for the two way data binding, but it adds following:

- Easy error display
- Support for the nested data structures
- Support for the arrays of data

It is implemented with the following components:

- `form-for` - Base component
- `attr-scope` - Scope context to the attribute
- `attr-repeater` - Implements the repeater (matrix) support
- `attr-errors` - Displays errors for the attribute
- `form-group` - Creates wrapper structure for the inputs based on the Twitter Bootstrap

It also implements the `errorsFor` helper which is used by `attr-errors` to list the errors.

FormFor component should be used with the `Validator` library which implements validation of the complex data structures.

## Basic use

To create form for the model instance you pass it to the `form-for` component:

    <form-for model="user">
      ...
    </form-for>

`this` inside the `form-for` component will be set to whatever is passed in the `model` attribute.

If we wanted to implement a simple login form for the user it would look like this:

    <form-for model="user">

      <label>Username</label>
      <input can-value="username">
      {{#errorsFor 'username'}}
        <ul class="list-unstyled">
          {{#this}}
            <li><span class="text-danger">{{ . }}</span></li>
          {{/this}}
        </ul>
      {{/errorsFor}}
      
      <label>Password</label>
      <input can-value="password" type="password">
      {{#errorsFor 'password'}}
        <ul class="list-unstyled">
          {{#this}}
            <li><span class="text-danger">{{ . }}</span></li>
          {{/this}}
        </ul>
      {{/errorsFor}}

      <button>Submit</button>

    </form-for>

As you can see using the `errorsFor` helper is pretty verbose, which is why the `attr-errors` component exists. By using the `attr-errors` component we can rewrite the previous example like this:

    <form-for model="user">

      <label>Username</label>
      <input can-value="username">
      <attr-errors for="username"></attr-errors>
      
      <label>Password</label>
      <input can-value="password" type="password">
      <attr-errors for="password"></attr-errors>

      <button>Submit</button>

    </form-for>

Nice and tidy.

## Attribute scope

Sometimes a model can have some kind of the nested data, and while we can easily use the `dot` notation to display these inputs, there is a shortcut we can use. If we wanted to create form for the following model:

    {
      username : "retro",
      password : "p4$$w0rd",
      address : {
        city : "Zagreb",
        country : "Croatia"
      }
    }

we can use the `attr-scope` helper:

    <form-for model="user">

      <label>Username</label>
      <input can-value="username">
      <attr-errors for="username"></attr-errors>
      
      <label>Password</label>
      <input can-value="password" type="password">
      <attr-errors for="password"></attr-errors>

      <attr-scope for="address">
        <label>City</label>
        <input can-value="city">
        <attr-errors for="city"></attr-errors>

        <label>Country</label>
        <input can-value="country">
        <attr-errors for="country"></attr-errors>
      </attr-scope>

      <button>Submit</button>

    </form-for>

## Attribute repeaters

If you want to display form fields for array of values, it can be a bit tricky, because you have to keep track of the indices in the array. This is what `attr-repeater` is used for. If you wanted to create a form for the following data:

    {
      username : "retro",
      password : "p4$$w0rd",
      socialNetworks : [{
        name : "Github",
        username : "retro"
      }, {
        name : "Twitter",
        username : "mihaelkonjevic"
      }]
    }

`attr-repeater` component allows us to write it like this:

    <form-for model="user">

      <label>Username</label>
      <input can-value="username">
      <attr-errors for="username"></attr-errors>
      
      <label>Password</label>
      <input can-value="password" type="password">
      <attr-errors for="password"></attr-errors>

      <attr-repeater for="socialNetworks">

        <label>Name</label>
        <input can-value="name">
        <attr-errors for="name"></attr-errors>

        <label>Username</label>
        <input can-value="username">
        <attr-errors for="username"></attr-errors>

      </attr-repeater>

      <button>Submit</button>

    </form-for>

Everything inside the `attr-repeater` will be repeated for each element in the array. It is live bound, so if you add or remove data from the model, it will be reflected in the form.

If you need to display an input for array of simple values (strings), you can use `@current` variable inside the repeater. For instance, if we wanted to create form for the blog post:

    {
      title : "FormFor Component",
      lead : 'New can component!',
      tags : ['canjs', 'javascript', 'component']
    }

You can do it like this:

    <form-for model="post">

      <label>Title</label>
      <input can-value="title">
      <attr-errors for="title"></attr-errors>
      
      <label>Lead</label>
      <textarea can-value="lead"></textarea>
      <attr-errors for="lead"></attr-errors>

      <attr-repeater for="tags">

        <label>Tag</label>
        <input can-value="{{ @current }}">
        <attr-errors></attr-errors>

      </attr-repeater>

      <button>Submit</button>

    </form-for>

In this case, you don't need to set the `for` attribute on the `attr-errors` component.

`attr-scope` and `attr-repeater` components can be nested to accommodate for any data structure you need.

## Form group

Form group is a simple component that allows you to write even shorter forms:

    <form-for model="user">
      
      <form-group label="Name" for="name">
        <input can-value="name" class="form-control">
      </form-group>
      
      <button>Submit</button>

    </form-for>

Is equivalent to:

    <form-for model="user">

      <div class="form-group {{#errorsFor 'name'}}has-error{{/errorsFor}}">
        
        <label>Name</label>
        <input can-value="name" class="form-control">
        
        <attr-errors for="name"></attr-errors>
      </div>

      <button>Submit</button>

    </form-for>