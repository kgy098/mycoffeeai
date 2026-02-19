-- Create banners table (메인 배너용, blend/month 없음)
CREATE TABLE IF NOT EXISTS `banners` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) DEFAULT NULL COMMENT '배너 제목(부제)',
    `comment` VARCHAR(255) DEFAULT NULL COMMENT '한줄평',
    `desc` TEXT DEFAULT NULL COMMENT '설명',
    `banner_url` VARCHAR(1024) DEFAULT NULL COMMENT '배너 이미지 URL',
    `is_visible` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '노출 여부',
    `sort_order` INT(11) NOT NULL DEFAULT 0 COMMENT '노출 순서',
    `created_by` INT(11) DEFAULT NULL COMMENT '등록자 user id',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_is_visible` (`is_visible`),
    KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='메인 배너';
