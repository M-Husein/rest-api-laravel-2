<?php

$standardPermissions = [
    'admin.access',
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'login_histories.view',
    'login_histories.view_own',
    'login_histories.delete',
    'cache.clear',
];

$advancedPermissions = [
    ...$standardPermissions,
    'users.restore',
    'users.force_delete',
    'articles.view',
    'articles.create',
    'articles.update',
    'articles.delete',
    'articles.publish',
    'contacts.view',
    'contacts.create',
    'contacts.update',
    'contacts.delete',
];

return [
    'default' => 'simple',

    'presets' => [
        'simple' => [
            'label' => 'Simple (role-only)',
            'description' => 'Admin and Member roles with role-based route protection. No granular permissions.',
            'roles' => [
                'Admin' => [],
                'Member' => [],
            ],
            'permissions' => [],
            'policies' => false,
        ],

        'standard' => [
            'label' => 'Standard (role + permission)',
            'description' => 'Roles plus granular permissions for admin resources and actions.',
            'roles' => [
                'Admin' => ['*'],
                'Member' => [],
            ],
            'permissions' => $standardPermissions,
            'policies' => false,
        ],

        'advanced' => [
            'label' => 'Advanced (RBAC + ABAC + policies)',
            'description' => 'Granular permissions, model policies, and conditional authorization checks.',
            'roles' => [
                'Admin' => ['*'],
                'Member' => ['login_histories.view_own'],
            ],
            'permissions' => $advancedPermissions,
            'policies' => true,
        ],

        'none' => [
            'label' => 'No RBAC',
            'description' => 'Disable role and permission enforcement. Authenticated users pass RBAC checks.',
            'roles' => [],
            'permissions' => [],
            'policies' => false,
        ],
    ],
];
