import React from 'react';

export default class AdminUserPageUserList extends React.Component {
  render() {
    const userList = this.props.users.map((user) => {
        return (
          <div key={user._id}>
            {user.username}
          </div>
        );
    });
    return (
      <div>
        {userList}
      </div>
    );
  }
}


