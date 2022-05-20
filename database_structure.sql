-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- 主机： db
-- 生成日期： 2022-01-03 13:48:25
-- 服务器版本： 10.6.4-MariaDB-1:10.6.4+maria~focal
-- PHP 版本： 7.4.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `todo`
--

-- --------------------------------------------------------

--
-- 表的结构 `attendants`
--

CREATE TABLE `attendants` (
  `id` int(11) NOT NULL,
  `proj_id` int(11) NOT NULL,
  `attendant_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 转存表中的数据 `attendants`
--

INSERT INTO `attendants` (`id`, `proj_id`, `attendant_name`) VALUES
(1, 1, 'mate1'),
(2, 1, 'mate2'),
(3, 2, 'mate1'),
(4, 2, 'mate2');

-- --------------------------------------------------------

--
-- 表的结构 `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `group_name` varchar(40) NOT NULL,
  `group_passwd` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 转存表中的数据 `groups`
--

INSERT INTO `groups` (`id`, `group_name`, `group_passwd`) VALUES
(1, '123', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(2, 'abc', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

-- --------------------------------------------------------

--
-- 表的结构 `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `proj_name` varchar(20) NOT NULL,
  `proj_desc` text NOT NULL,
  `proj_updated` date NOT NULL DEFAULT current_timestamp(),
  `proj_progress` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 转存表中的数据 `projects`
--

INSERT INTO `projects` (`id`, `group_id`, `proj_name`, `proj_desc`, `proj_updated`, `proj_progress`) VALUES
(1, 1, 'project1', 'test', '2021-09-24', 0),
(2, 2, 'ABC', 'qwertyuio', '2021-12-07', 0);

--
-- 转储表的索引
--

--
-- 表的索引 `attendants`
--
ALTER TABLE `attendants`
  ADD PRIMARY KEY (`id`);

--
-- 表的索引 `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- 表的索引 `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `attendants`
--
ALTER TABLE `attendants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用表AUTO_INCREMENT `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用表AUTO_INCREMENT `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
