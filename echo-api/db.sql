-- Dumping database structure for echo
CREATE DATABASE IF NOT EXISTS `echo`;
USE `echo`;

-- Dumping structure for table echo.users
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping structure for table echo.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL DEFAULT 'Unnamed',
  `description` text NOT NULL,
  `maxUsers` int(11) NOT NULL DEFAULT 200,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping structure for table echo.room_users
CREATE TABLE IF NOT EXISTS `room_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `roomId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_users_roomusers` (`userId`),
  KEY `fk_rooms_roomusers` (`roomId`),
  CONSTRAINT `fk_rooms_roomusers` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_roomusers` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping structure for table echo.audiosettings
CREATE TABLE IF NOT EXISTS `audiosettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sampleRate` int(11) NOT NULL,
  `bits` int(11) NOT NULL,
  `channels` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping structure for table echo.userfriends
CREATE TABLE IF NOT EXISTS `userfriends` (
  `id` int(11) NOT NULL,
  `otherId` int(11) NOT NULL,
  KEY `fk_userFriends_users_id` (`id`),
  KEY `fk_userFriends_users_otherId` (`otherId`),
  CONSTRAINT `fk_userFriends_users_id` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_userFriends_users_otherId` FOREIGN KEY (`otherId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping structure for table echo.uservolumes
CREATE TABLE IF NOT EXISTS `uservolumes` (
  `id` int(11) NOT NULL,
  `otherId` int(11) NOT NULL,
  `volume` float NOT NULL DEFAULT 1,
  KEY `u_id` (`id`),
  KEY `u_otherId` (`otherId`),
  CONSTRAINT `fk_users_userVolumes` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
