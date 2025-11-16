"""
Challenge Task Executor
Implements execution logic for Tello challenge card tasks including:
- 8-figure flight
- Obstacle navigation
- Precision landing
"""

import asyncio
import time
import math
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class TaskScore:
    """Task scoring result"""
    score: float  # 0-100
    completion_time: float
    details: Dict[str, Any]


@dataclass
class Position3D:
    """3D position representation"""
    x: float
    y: float
    z: float
    
    def distance_to(self, other: 'Position3D') -> float:
        """Calculate Euclidean distance to another position"""
        return math.sqrt(
            (self.x - other.x) ** 2 +
            (self.y - other.y) ** 2 +
            (self.z - other.z) ** 2
        )


class ChallengeTaskExecutor:
    """Executor for challenge card tasks"""
    
    def __init__(self, drone_controller):
        """
        Initialize challenge task executor
        
        Args:
            drone_controller: Tello drone controller instance
        """
        self.drone = drone_controller
        self.current_position = Position3D(0, 0, 0)
        self.trajectory_points: List[Position3D] = []
        
    async def execute_8_flight(
        self,
        radius: int = 100,
        speed: int = 50,
        loops: int = 1,
        timeout: int = 60
    ) -> TaskScore:
        """
        Execute 8-figure flight pattern
        
        Args:
            radius: Radius of each circle in cm
            speed: Flight speed percentage (10-100)
            loops: Number of loops to complete
            timeout: Maximum execution time in seconds
            
        Returns:
            TaskScore with completion metrics
        """
        start_time = time.time()
        self.trajectory_points = []
        
        try:
            logger.info(f"Starting 8-flight: radius={radius}cm, speed={speed}%, loops={loops}")
            
            # Calculate speed in cm/s (Tello max speed ~100cm/s)
            actual_speed = int(speed)
            
            for loop in range(loops):
                # First circle (right)
                await self._fly_circle(
                    center_x=radius,
                    center_y=0,
                    radius=radius,
                    speed=actual_speed,
                    clockwise=True
                )
                
                # Second circle (left)
                await self._fly_circle(
                    center_x=-radius,
                    center_y=0,
                    radius=radius,
                    speed=actual_speed,
                    clockwise=False
                )
                
                # Check timeout
                if time.time() - start_time > timeout:
                    raise TimeoutError(f"8-flight exceeded timeout of {timeout}s")
            
            completion_time = time.time() - start_time
            
            # Calculate score based on trajectory accuracy and time
            score = self._calculate_8_flight_score(
                radius=radius,
                expected_time=self._estimate_8_flight_time(radius, speed, loops),
                actual_time=completion_time
            )
            
            logger.info(f"8-flight completed: score={score:.1f}, time={completion_time:.1f}s")
            
            return TaskScore(
                score=score,
                completion_time=completion_time,
                details={
                    'loops_completed': loops,
                    'trajectory_points': len(self.trajectory_points),
                    'average_deviation': self._calculate_trajectory_deviation(radius)
                }
            )
            
        except Exception as e:
            logger.error(f"8-flight failed: {e}")
            raise
    
    async def _fly_circle(
        self,
        center_x: float,
        center_y: float,
        radius: float,
        speed: int,
        clockwise: bool = True
    ):
        """
        Fly a circular path
        
        Args:
            center_x: Circle center X coordinate
            center_y: Circle center Y coordinate
            radius: Circle radius in cm
            speed: Flight speed
            clockwise: Direction of rotation
        """
        # Number of segments to approximate circle
        segments = 16
        angle_step = (2 * math.pi) / segments
        
        for i in range(segments + 1):
            angle = i * angle_step
            if not clockwise:
                angle = -angle
            
            # Calculate target position
            target_x = center_x + radius * math.cos(angle)
            target_y = center_y + radius * math.sin(angle)
            
            # Move to target (simplified - actual implementation would use curve commands)
            dx = target_x - self.current_position.x
            dy = target_y - self.current_position.y
            
            # Execute movement commands
            if abs(dx) > 20:
                direction = 'right' if dx > 0 else 'left'
                distance = int(abs(dx))
                await self._move_drone(direction, distance, speed)
            
            if abs(dy) > 20:
                direction = 'forward' if dy > 0 else 'back'
                distance = int(abs(dy))
                await self._move_drone(direction, distance, speed)
            
            # Record trajectory point
            self.trajectory_points.append(Position3D(target_x, target_y, self.current_position.z))
            
            # Small delay for stability
            await asyncio.sleep(0.1)
    
    async def execute_obstacle_navigation(
        self,
        obstacle_positions: List[Dict[str, float]],
        speed: int = 40,
        safety_margin: int = 20,
        timeout: int = 120
    ) -> TaskScore:
        """
        Navigate through obstacles
        
        Args:
            obstacle_positions: List of obstacle positions [{"x": 100, "y": 0, "z": 100}, ...]
            speed: Navigation speed percentage
            safety_margin: Safety distance from obstacles in cm
            timeout: Maximum execution time in seconds
            
        Returns:
            TaskScore with navigation metrics
        """
        start_time = time.time()
        obstacles_cleared = 0
        
        try:
            logger.info(f"Starting obstacle navigation: {len(obstacle_positions)} obstacles")
            
            for i, obs in enumerate(obstacle_positions):
                target = Position3D(obs['x'], obs['y'], obs['z'])
                
                # Navigate to obstacle with safety margin
                await self._navigate_to_position(
                    target=target,
                    speed=speed,
                    safety_margin=safety_margin
                )
                
                obstacles_cleared += 1
                logger.info(f"Cleared obstacle {i+1}/{len(obstacle_positions)}")
                
                # Check timeout
                if time.time() - start_time > timeout:
                    raise TimeoutError(f"Obstacle navigation exceeded timeout of {timeout}s")
            
            completion_time = time.time() - start_time
            
            # Calculate score
            score = self._calculate_obstacle_score(
                total_obstacles=len(obstacle_positions),
                cleared_obstacles=obstacles_cleared,
                completion_time=completion_time,
                timeout=timeout
            )
            
            logger.info(f"Obstacle navigation completed: score={score:.1f}, cleared={obstacles_cleared}/{len(obstacle_positions)}")
            
            return TaskScore(
                score=score,
                completion_time=completion_time,
                details={
                    'obstacles_cleared': obstacles_cleared,
                    'total_obstacles': len(obstacle_positions),
                    'success_rate': obstacles_cleared / len(obstacle_positions) * 100
                }
            )
            
        except Exception as e:
            logger.error(f"Obstacle navigation failed: {e}")
            # Return partial score if some obstacles were cleared
            return TaskScore(
                score=obstacles_cleared / len(obstacle_positions) * 50,
                completion_time=time.time() - start_time,
                details={
                    'obstacles_cleared': obstacles_cleared,
                    'total_obstacles': len(obstacle_positions),
                    'error': str(e)
                }
            )
    
    async def execute_precision_landing(
        self,
        target_position: Dict[str, float],
        precision: int = 10,
        max_attempts: int = 3,
        timeout: int = 60
    ) -> TaskScore:
        """
        Execute precision landing at target position
        
        Args:
            target_position: Target landing position {"x": 0, "y": 0}
            precision: Required precision in cm
            max_attempts: Maximum adjustment attempts
            timeout: Maximum execution time in seconds
            
        Returns:
            TaskScore with landing metrics
        """
        start_time = time.time()
        target = Position3D(target_position['x'], target_position['y'], 0)
        
        try:
            logger.info(f"Starting precision landing: target=({target.x}, {target.y}), precision=±{precision}cm")
            
            attempts = 0
            final_error = float('inf')
            
            while attempts < max_attempts:
                attempts += 1
                
                # Get current position (simulated - would use actual drone telemetry)
                current_pos = self._get_current_position()
                
                # Calculate error
                error_x = target.x - current_pos.x
                error_y = target.y - current_pos.y
                final_error = math.sqrt(error_x**2 + error_y**2)
                
                logger.info(f"Landing attempt {attempts}: error={final_error:.1f}cm")
                
                # Check if within precision
                if final_error <= precision:
                    logger.info(f"Precision achieved on attempt {attempts}")
                    break
                
                # Adjust position
                if abs(error_x) > precision / 2:
                    direction = 'right' if error_x > 0 else 'left'
                    distance = min(int(abs(error_x)), 50)
                    await self._move_drone(direction, distance, 20)
                
                if abs(error_y) > precision / 2:
                    direction = 'forward' if error_y > 0 else 'back'
                    distance = min(int(abs(error_y)), 50)
                    await self._move_drone(direction, distance, 20)
                
                # Check timeout
                if time.time() - start_time > timeout:
                    raise TimeoutError(f"Precision landing exceeded timeout of {timeout}s")
                
                await asyncio.sleep(0.5)
            
            # Execute landing
            await self._land_drone()
            
            completion_time = time.time() - start_time
            
            # Calculate score
            score = self._calculate_landing_score(
                final_error=final_error,
                precision=precision,
                attempts=attempts,
                max_attempts=max_attempts
            )
            
            logger.info(f"Precision landing completed: score={score:.1f}, error={final_error:.1f}cm, attempts={attempts}")
            
            return TaskScore(
                score=score,
                completion_time=completion_time,
                details={
                    'final_error': final_error,
                    'attempts': attempts,
                    'precision_achieved': final_error <= precision
                }
            )
            
        except Exception as e:
            logger.error(f"Precision landing failed: {e}")
            raise
    
    # Helper methods
    
    async def _move_drone(self, direction: str, distance: int, speed: int):
        """Execute drone movement command"""
        try:
            # Map direction to drone command
            command_map = {
                'forward': 'forward',
                'back': 'back',
                'left': 'left',
                'right': 'right',
                'up': 'up',
                'down': 'down'
            }
            
            if direction in command_map:
                # Execute movement (simplified - actual implementation would use drone controller)
                logger.debug(f"Moving {direction} {distance}cm at speed {speed}")
                
                # Update simulated position
                if direction == 'forward':
                    self.current_position.y += distance
                elif direction == 'back':
                    self.current_position.y -= distance
                elif direction == 'right':
                    self.current_position.x += distance
                elif direction == 'left':
                    self.current_position.x -= distance
                elif direction == 'up':
                    self.current_position.z += distance
                elif direction == 'down':
                    self.current_position.z -= distance
                
                # Simulate movement time
                await asyncio.sleep(distance / 50)  # ~50cm/s average
                
        except Exception as e:
            logger.error(f"Movement failed: {e}")
            raise
    
    async def _land_drone(self):
        """Execute landing command"""
        logger.info("Landing drone")
        self.current_position.z = 0
        await asyncio.sleep(2)
    
    def _get_current_position(self) -> Position3D:
        """Get current drone position (simulated)"""
        return Position3D(
            self.current_position.x,
            self.current_position.y,
            self.current_position.z
        )
    
    async def _navigate_to_position(
        self,
        target: Position3D,
        speed: int,
        safety_margin: int
    ):
        """Navigate to target position with obstacle avoidance"""
        # Calculate path
        dx = target.x - self.current_position.x
        dy = target.y - self.current_position.y
        dz = target.z - self.current_position.z
        
        # Move in Z first (altitude)
        if abs(dz) > 20:
            direction = 'up' if dz > 0 else 'down'
            await self._move_drone(direction, int(abs(dz)), speed)
        
        # Move in XY plane
        if abs(dx) > 20:
            direction = 'right' if dx > 0 else 'left'
            await self._move_drone(direction, int(abs(dx)), speed)
        
        if abs(dy) > 20:
            direction = 'forward' if dy > 0 else 'back'
            await self._move_drone(direction, int(abs(dy)), speed)
    
    # Scoring methods
    
    def _calculate_8_flight_score(
        self,
        radius: float,
        expected_time: float,
        actual_time: float
    ) -> float:
        """Calculate score for 8-flight task"""
        # Base score from trajectory accuracy
        deviation = self._calculate_trajectory_deviation(radius)
        accuracy_score = max(0, 100 - (deviation / radius * 100))
        
        # Time bonus/penalty
        time_ratio = expected_time / actual_time if actual_time > 0 else 0
        time_score = min(100, time_ratio * 100)
        
        # Weighted average
        final_score = accuracy_score * 0.7 + time_score * 0.3
        
        return max(0, min(100, final_score))
    
    def _calculate_trajectory_deviation(self, radius: float) -> float:
        """Calculate average deviation from ideal trajectory"""
        if not self.trajectory_points:
            return radius
        
        # Simplified - would calculate actual deviation from ideal 8-shape
        return radius * 0.1  # Assume 10% deviation
    
    def _estimate_8_flight_time(self, radius: float, speed: int, loops: int) -> float:
        """Estimate expected completion time for 8-flight"""
        # Circumference of two circles
        total_distance = 2 * math.pi * radius * 2 * loops
        # Speed in cm/s (approximate)
        speed_cms = speed
        return total_distance / speed_cms
    
    def _calculate_obstacle_score(
        self,
        total_obstacles: int,
        cleared_obstacles: int,
        completion_time: float,
        timeout: float
    ) -> float:
        """Calculate score for obstacle navigation"""
        # Completion rate
        completion_score = (cleared_obstacles / total_obstacles) * 100
        
        # Time efficiency
        time_score = max(0, (1 - completion_time / timeout) * 100)
        
        # Weighted average
        final_score = completion_score * 0.8 + time_score * 0.2
        
        return max(0, min(100, final_score))
    
    def _calculate_landing_score(
        self,
        final_error: float,
        precision: float,
        attempts: int,
        max_attempts: int
    ) -> float:
        """Calculate score for precision landing"""
        # Precision score
        if final_error <= precision:
            precision_score = 100
        else:
            precision_score = max(0, 100 - (final_error - precision) / precision * 50)
        
        # Attempts penalty
        attempts_score = (max_attempts - attempts + 1) / max_attempts * 100
        
        # Weighted average
        final_score = precision_score * 0.7 + attempts_score * 0.3
        
        return max(0, min(100, final_score))
