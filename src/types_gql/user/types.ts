import { objectType, extendType, list, nonNull, nullable, stringArg } from 'nexus';
// ****************************************************************************************************
export const userIn = {
    id: nonNull(stringArg()),
    password: stringArg(),
    // roleId: stringArg(),
    description: stringArg(),
    address: stringArg(),
    first_name: stringArg(),
    last_name: stringArg(),
    phone: stringArg(),
    fax: stringArg(),
    email: stringArg(),
}
export const UserOut = objectType({
    name: 'UserOut',
    definition(t) {
        ["id", "roleId", "description", "address", "first_name", "last_name", "phone", "fax", "email", "createdAt", "updatedAt"].map(x =>
            t.nullable.string(x)
        )
    },
});
// ****************************************************************************************************
export const userPhotoSetIn = {
    userId: nonNull(stringArg()),
    photo: nonNull(stringArg()),
}
export const userPhotoGetIn = {
    userId: nonNull(stringArg())
}
export const userPhotoOut = objectType({
    name: 'userPhotoOut',
    definition(t) {
        ["userId", "photo", "createdAt", "updatedAt"].map(x =>
            t.nullable.string(x)
        )
    },
});
// ****************************************************************************************************
export const userAuthenticationIn = {
    id: nonNull(stringArg()),
    password: nonNull(stringArg()),
}
export const userAuthenticationOut = objectType({
    name: 'userAuthenticationOut',
    definition(t) {
        ["Authorization"].map(x =>
            t.nullable.string(x)
        )
    },
});
// ****************************************************************************************************
export const userDeletIn = {
    id: nonNull(stringArg())
};
// ****************************************************************************************************
export const userRoleIn = {
    id: nonNull(stringArg()),
    roleId: nonNull(stringArg())
};
export const userRoleOut = objectType({
    name: 'userRoleOut',
    definition(t) {
        ["deleted"].map(x =>
            t.string(x)
        )
    },
});
// ****************************************************************************************************
export const userNotificationOut = objectType({
    name: 'userNotificationOut',
    definition(t) {
        t.nullable.int('sender_id');
        t.nullable.int('receiver_id');
        t.nullable.string('title');
        t.nullable.string('content');
    },
});
// ****************************************************************************************************
