CREATE DATABASE IF NOT EXISTS `echo`;
USE `echo`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(300) NOT NULL,
  `email` varchar(300) NOT NULL,
  `password` varchar(64) NOT NULL,
  `img` text NOT NULL,
  `ip` varchar(50) NOT NULL,
  `online` enum('0','1','2','3','4') NOT NULL DEFAULT '0',
  `firstJoin` datetime NOT NULL DEFAULT current_timestamp(),
  `lastSeen` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `u_name` (`name`),
  UNIQUE KEY `u_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL DEFAULT 'Unnamed',
  `description` text NOT NULL,
  `maxUsers` int(11) NOT NULL DEFAULT 200,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `room_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` text DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `roomId` bigint(20) DEFAULT NULL,
  `date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `insertDate` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_users_roomMessages` (`userId`),
  KEY `FK_rooms_roomMessages` (`roomId`),
  CONSTRAINT `FK_rooms_roomMessages` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_users_roomMessages` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `room_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `roomId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_users_roomusers` (`userId`),
  KEY `fk_rooms_roomusers` (`roomId`),
  CONSTRAINT `fk_rooms_roomusers` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_roomusers` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=347 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user_friends` (
  `id` int(11) DEFAULT NULL,
  `otherId` int(11) DEFAULT NULL,
  KEY `fk_userFriends_users_id` (`id`),
  KEY `fk_userFriends_users_otherId` (`otherId`),
  CONSTRAINT `fk_userFriends_users_id` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_userFriends_users_otherId` FOREIGN KEY (`otherId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user_volumes` (
  `id` int(11) DEFAULT NULL,
  `otherId` int(11) DEFAULT NULL,
  `volume` float NOT NULL DEFAULT 1,
  KEY `u_id` (`id`),
  KEY `u_otherId` (`otherId`),
  CONSTRAINT `fk_users_userVolumes` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
