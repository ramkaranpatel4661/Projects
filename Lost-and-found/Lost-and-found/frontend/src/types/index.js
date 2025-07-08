/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [location]
 * @property {string} [avatar]
 * @property {boolean} isVerified
 * @property {string} lastActive
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ItemImage
 * @property {string} filename
 * @property {string} originalName
 * @property {string} path
 * @property {number} size
 * @property {string} uploadDate
 */

/**
 * @typedef {Object} ItemLocation
 * @property {string} address
 * @property {string} city
 * @property {{latitude: number, longitude: number}} [coordinates]
 */

/**
 * @typedef {Object} ContactInfo
 * @property {'email'|'phone'|'chat'} preferredMethod
 * @property {string} [phone]
 * @property {string} [email]
 * @property {boolean} showPhone
 * @property {boolean} showEmail
 */

/**
 * @typedef {'Electronics'|'Clothing'|'Accessories'|'Documents'|'Keys'|'Bags'|'Jewelry'|'Books'|'Sports Equipment'|'Pet Items'|'Toys'|'Other'} ItemCategory
 */

/**
 * @typedef {Object} Item
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {ItemCategory} category
 * @property {'found'|'lost'} type
 * @property {'active'|'resolved'|'expired'} status
 * @property {ItemImage[]} images
 * @property {string[]} imageUrls
 * @property {ItemLocation} location
 * @property {string} [dateFound]
 * @property {string} [dateLost]
 * @property {ContactInfo} contactInfo
 * @property {User} postedBy
 * @property {string[]} tags
 * @property {number} views
 * @property {boolean} isActive
 * @property {string} expiresAt
 * @property {string} [matchedWith]
 * @property {'low'|'medium'|'high'} priority
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Message
 * @property {string} _id
 * @property {User} sender
 * @property {string} content
 * @property {'text'|'image'|'system'} messageType
 * @property {{user: string, readAt: string}[]} readBy
 * @property {boolean} isEdited
 * @property {string} [editedAt]
 * @property {string} [replyTo]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ChatParticipant
 * @property {User} user
 * @property {string} joinedAt
 * @property {string} lastSeen
 * @property {'owner'|'inquirer'} role
 */

/**
 * @typedef {Object} Chat
 * @property {string} _id
 * @property {Item} item
 * @property {ChatParticipant[]} participants
 * @property {Message[]} messages
 * @property {'active'|'resolved'|'archived'} status
 * @property {string} lastActivity
 * @property {boolean} isActive
 * @property {{totalMessages: number, unreadCounts: {user: string, count: number}[]}} metadata
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ChatWithDetails
 * @property {number} unreadCount
 * @property {Message} [latestMessage]
 * @property {User} [otherParticipant]
 * @property {Chat} (all Chat fields)
 */

/**
 * @typedef {Object} LoginData
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} [phone]
 * @property {string} [location]
 */

/**
 * @typedef {Object} PostItemData
 * @property {string} title
 * @property {string} description
 * @property {ItemCategory} category
 * @property {'found'|'lost'} type
 * @property {ItemLocation} location
 * @property {string} [dateFound]
 * @property {string} [dateLost]
 * @property {ContactInfo} contactInfo
 * @property {'low'|'medium'|'high'} [priority]
 * @property {File[]} images
 */

/**
 * @typedef {Object} SearchFilters
 * @property {'found'|'lost'} [type]
 * @property {ItemCategory} [category]
 * @property {string} [city]
 * @property {string} [search]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} currentPage
 * @property {number} totalPages
 * @property {number} totalItems
 * @property {number} itemsPerPage
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

/**
 * @typedef {Object} ApiResponse
 * @property {any} data
 * @property {string} [message]
 */

/**
 * @typedef {Object} ItemsResponse
 * @property {Item[]} items
 * @property {PaginationInfo} pagination
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 * @property {string} message
 */

/**
 * @typedef {Object} UserStats
 * @property {number} totalItems
 * @property {number} foundItems
 * @property {number} lostItems
 */

/**
 * @typedef {Object} UserProfile
 * @property {UserStats} stats
 * @property {Item[]} recentItems
 * @property {User} (all User fields)
 */