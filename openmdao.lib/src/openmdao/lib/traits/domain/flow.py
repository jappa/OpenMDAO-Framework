_GRID_LOCATIONS = ('Vertex', 'CellCenter')

class FlowSolution(object):
    """ Contains flow solution variables for a :class:`Zone`. """

    def __init__(self):
        self._grid_location = 'Vertex'
        self._ghosts = [0, 0, 0, 0, 0, 0]
        self._arrays = []
        self._vectors = []

    def _get_grid_location(self):
        return self._grid_location

    def _set_grid_location(self, loc):
        if loc not in _GRID_LOCATIONS:
            raise ValueError("'%s' is not a valid grid location" % loc)
        self._grid_location = loc

    grid_location = property(_get_grid_location, _set_grid_location)

    def _get_ghosts(self):
        return self._ghosts

    def _set_ghosts(self, ghosts):
        if len(ghosts) != 6:
            raise ValueError('ghosts must be a 6-element array')
        for i in ghosts:
            if i < 0:
                raise ValueError('All ghost values must be >= 0')
        self._ghosts = ghosts

    ghosts = property(_get_ghosts, _set_ghosts)

    @property
    def arrays(self):
        return self._arrays

    @property
    def vectors(self):
        return self._vectors

    def add_array(self, name, array):
        """ Add an array bound to `name`. Returns the added array. """
        if hasattr(self, name):
            raise ValueError("name '%s' is already bound" % name)
        setattr(self, name, array)
        self._arrays.append(array)
        return array

    def add_vector(self, name, vector):
        """ Add a :class:`Vector` bound to `name`. Returns the added vector. """
        if hasattr(self, name):
            raise ValueError("name '%s' is already bound" % name)
        setattr(self, name, vector)
        self._vectors.append(vector)
        return vector

    def is_equivalent(self, other, logger):
        """ Test if self and `other` are equivalent. """
        if not isinstance(other, FlowSolution):
            logger.debug('other is not a FlowSolution object.')
            return False

        if self.grid_location != other.grid_location:
            logger.debug('grid locations are not equal.')
            return False

        for arr in self._arrays:
            name = self.name_of_obj(arr)
            if name is None:
                raise AttributeError('cannot find array!')
            try:
                other_arr = getattr(other, name)
            except AttributeError:
                logger.debug("other is missing array '%s'", name)
                return False
            if (other_arr != arr).any():
                logger.debug('%s values are not equal.', name)
                return False

        for vector in self._vectors:
            name = self.name_of_obj(vector)
            if name is None:
                raise AttributeError('cannot find vector!')
            try:
                other_vector = getattr(other, name)
            except AttributeError:
                logger.debug("other is missing vector '%s'", name)
                return False
            if not vector.is_equivalent(other_vector, name, logger):
                return False

# TODO: check scalars

        return True

    def name_of_obj(self, obj):
        """ Return name of object. """
        for name, value in self.__dict__.items():
            if value is obj:
                return name
        return None

    def flip_z(self):
        """ Convert to other-handed coordinate system. """
        for vector in self._vectors:
            vector.flip_z()

    def make_cartesian(self):
        """ Convert to cartesian coordinate system. """
        for vector in self._vectors:
            vector.make_cartesian()

    def make_cylindrical(self):
        """ Convert to cylindrical coordinate system. """
        for vector in self._vectors:
            vector.make_cylindrical()

    def rotate_about_x(self, deg):
        """ Rotate about the X axis by `deg` degrees. """
        for vector in self._vectors:
            vector.rotate_about_x(deg)

    def rotate_about_y(self, deg):
        """ Rotate about the Y axis by `deg` degrees. """
        for vector in self._vectors:
            vector.rotate_about_y(deg)

    def rotate_about_z(self, deg):
        """ Rotate about the Z axis by `deg` degrees. """
        for vector in self._vectors:
            vector.rotate_about_z(deg)

